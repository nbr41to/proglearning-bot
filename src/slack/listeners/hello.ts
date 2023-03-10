import { App } from '@slack/bolt';

export function helloListener(app: App): void {
  app.message('hello', async ({ logger, ...rest }) => {
    console.dir(rest, { depth: null });
    logger.info(rest);
    // console.log('user', message.user);
    // await say(`Hey there <@${message.user}>`);
  });
}
