import AccountNotification from "../database/models/account_notification";

/**
 * Create a new AccountNotification record in the database. A AccountNotification record represents a single account.
 *
 * @param type - indicates the type of notification to be sent. This can be either "apns" or "upush".
 * @param token - uniquely identifies a single device. This can be a string from APNs, or an endpoint for UnifiedPush.
 * @param jwt - authentication token of the user. This is required in order to fetch notifications on behalf of the user.
 *
 * @returns the created AccountNotification record
 */
async function addAccountNotification(
  type: string,
  token: string,
  jwt: string,
  instance: string,
): Promise<AccountNotification> {
  // First, check to see if the Notification record already exists for a given [jwt]
  let existingAccountNotification = await AccountNotification.findOne({ where: { jwt } });
  
  if (!existingAccountNotification) {
    const notification = await AccountNotification.create({ type, token, jwt, instance });
    await notification.save();

    return notification;
  }
  
  if (existingAccountNotification && existingAccountNotification.get("type") === type && existingAccountNotification.get("token") === token && existingAccountNotification.get("instance") === instance) {
    // Check to see if all the fields match. If so, we don't need to create a new AccountNotification record.
    return existingAccountNotification;
  } else {
    // Update the existing AccountNotification record
    existingAccountNotification = await existingAccountNotification?.update({ type, token, instance });
    return existingAccountNotification;
  }
}

/**
 * Retrieves an array of existing AccountNotification record for a single device.
 *
 * @param token - uniquely identifies a single device. This can be a string from APNs, or an endpoint for UnifiedPush.
 *
 * @returns an array of AccountNotification records
 */
async function getAccountNotification(token: string): Promise<AccountNotification[]> {
  return await AccountNotification.findAll({ where: { token } });
}

/**
 * Deletes one or more AccountNotification records in the database.
 * If [jwt] is provided, only the AccountNotification records associated with the [jwt] will be deleted.
 * If [token] is provided, only the AccountNotification records associated with the [token] will be deleted.
 *
 * @param jwt - authentication token of the user. This is required in order to fetch notifications on behalf of the user.
 * @param token - uniquely identifies a single device. This can be a string from APNs, or an endpoint for UnifiedPush.
 *
 * @returns the number of deleted AccountNotification records
 */
async function deleteAccountNotification(
  jwt: string | undefined,
  token: string | undefined
): Promise<number> {
  if (!jwt && !token) throw new Error("Either jwt or token must be provided");
  if (jwt && token) throw new Error("Only one of jwt or token can be provided");

  if (jwt) return await AccountNotification.destroy({ where: { jwt } });

  return await AccountNotification.destroy({ where: { token } });
}

async function generateTestNotification(
  jwt: string | undefined,
): Promise<[affectedCount: number]> {
  return AccountNotification.update({ testQueued: true }, { where: { jwt } });
}

export { addAccountNotification, getAccountNotification, deleteAccountNotification, generateTestNotification };
