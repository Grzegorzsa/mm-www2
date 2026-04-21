/**
 * installation controller
 */

import { factories } from '@strapi/strapi'
import authHelper from '../../../helpers/auth'
import installationsHelper from '../../../helpers/installationsHelper'
import { AuthUser, Installation } from '../../../../types/helperTypes'
import { sendJuceNotAuthorised } from '../../../helpers/juceRSA'

// const wait = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec * 1000));

let maxInstallations = 2

if (!isNaN(parseInt(process.env.MAX_INSTALLATIONS)))
  maxInstallations = parseInt(process.env.MAX_INSTALLATIONS)

export default factories.createCoreController('api::installation.installation', ({ strapi }) => {
  const { authenticateUserPW } = authHelper(strapi)
  const {
    getUserInstallations,
    getInstallationByToken,
    createAndSendNewInstallation,
    updateAndSendExistingInstallation,
    getUserByToken,
    removeInstallation,
    getInstallationsByUserID,
  } = installationsHelper(strapi)
  return {
    // Get all installations for the user (used in user panel)
    async find(ctx) {
      const { user } = ctx.state
      if (!user) return ctx.unauthorized()
      // await wait(3);
      // get active user installations
      const installations = await getInstallationsByUserID(user.id)
      ctx.response.body = installations
    },

    // Revalidate existing installation using token (if it's not disabled) - it doesn't try to update license information
    // Used by the plugin to revalidate the installation
    async findOne(ctx) {
      // const { user } = ctx.state;
      // if (!user) return ctx.unauthorized();
      // const { id, username, email } = user;
      // console.log("user: ", { id, username, email });
      // console.log(ctx.header);
      // console.log(ctx.headers);
      // console.log("params: ", ctx.params);
      // await wait(1);
      // const a = performance.now();
      const mach = ctx.params.id
      const { token } = ctx.header
      if (Array.isArray(token)) return sendJuceNotAuthorised(ctx, 'Authorizatin failed')
      // console.log("GET: token: ", token, ", mach: ", mach);
      if (!token || !mach) return sendJuceNotAuthorised(ctx, 'Authorizatin failed')
      const installation = await getInstallationByToken(token)
      if (
        !installation ||
        installation.disabled ||
        installation.machineId !== mach ||
        !installation.certificate ||
        !installation.user ||
        installation.user.blocked
      ) {
        return sendJuceNotAuthorised(ctx, 'Authorizatin failed')
      }

      let certificate = ''
      try {
        certificate = atob(installation.certificate)
      } catch (error) {
        // console.log("Error: ", error);
        return sendJuceNotAuthorised(ctx, 'Authorizatin failed')
      }
      ctx.set('Content-Type', 'text/xml; charset=utf-8')
      ctx.response.body = certificate
      // const c = performance.now();
      // console.log("GET installation 2 took " + (c - a) + " ms.");
    },

    /** Login plugin or external app, get new installation or revalidate existing one */
    async create(ctx) {
      // console.log("Create called");
      // await wait(1);
      // const a = performance.now();
      const { email, pw, product, mach, prevMach, token, os, compName } = ctx.request.body
      if (!(email && pw) && !token) return sendJuceNotAuthorised(ctx, 'Not authorized')
      const ver = parseInt(ctx.request.body.ver)
      // console.log("create:: email: ", email, "Pass: ", pw, ", token: ", token, "ver: ", ver);
      // console.log("=======================================================================");

      // 1) Authenticate the user
      let user: Partial<AuthUser>
      if (email && pw) {
        // console.log("Authenticat user with user and password");
        user = await authenticateUserPW(email, pw)
      } else {
        // console.log("Authenticate user with token");
        user = await getUserByToken(token)
      }
      // console.log("user: ", user);
      if (user.error) return sendJuceNotAuthorised(ctx, user.error)
      // 2) Get all user installations
      const userInstallations = await getUserInstallations(user.email, product)
      // console.log("user installations: ", JSON.stringify(userInstallations, null, 2));

      // 3) Check if current installations are valid if yes issue new certificate
      //  a) Check if there are no certifications
      if (userInstallations.length === 0) {
        // console.log("No installations found, create new one");
        await createAndSendNewInstallation(user, mach, product, ver, os, compName, ctx)
        // const b = performance.now();
        // console.log("Create installation took " + (b - a) + " ms.");
        return
      }

      //  b) Current installation match details - issue new certificate
      const currentInstallation = userInstallations.find((i) => i.machineId === mach)
      if (currentInstallation) {
        // console.log("Update current installation and send new certificate");
        await updateAndSendExistingInstallation(
          currentInstallation,
          false,
          user,
          mach,
          product,
          ver,
          ctx,
        )
        // const b = performance.now();
        // console.log("Create installation took " + (b - a) + " ms.");
        return
      }

      // c) machine id changed - update machine id and send certificate
      const prevInstallation = userInstallations.find((i: Installation) => i.machineId === prevMach)
      if (prevInstallation) {
        // 1. Update machineId
        // console.log("Update and send existing installation");
        await updateAndSendExistingInstallation(
          prevInstallation,
          mach,
          user,
          mach,
          product,
          ver,
          ctx,
        )
        // const b = performance.now();
        // console.log("Create installation took " + (b - a) + " ms.");
        return
      }

      // 4) Check if max installations reached. If yes return error
      if (userInstallations.length >= maxInstallations) {
        // console.log("Installation limit reached!!");
        return sendJuceNotAuthorised(ctx, 'Maximum number of active installation reached.')
      }

      // console.log("create new installation");
      await createAndSendNewInstallation(user, mach, product, ver, os, compName, ctx)
      // console.log("=======================================================================");
      // const b = performance.now();
      // console.log("Create installation took " + (b - a) + " ms.");
    },

    // delete fnction in strapi
    async delete(ctx) {
      // console.log("Delete called");
      // await wait(1);
      // const a = performance.now();
      const mach = ctx.params.id
      const { token } = ctx.header
      // console.log("Delete: mach: ", mach, ", token: ", token);
      if (!mach || !token) return sendJuceNotAuthorised(ctx, 'Not authorized')
      if (Array.isArray(token)) return sendJuceNotAuthorised(ctx, 'Not authorized')
      const installation = await getInstallationByToken(token)
      // console.log(installation);
      if (!installation || installation.machineId !== mach)
        return sendJuceNotAuthorised(ctx, 'Not authorized')
      await removeInstallation(installation)
      ctx.response.body = 'Installation deleted'
      // const b = performance.now();
      // console.log("Delete installation took " + (b - a) + " ms.");
    },
  }
})
