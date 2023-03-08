import { App } from '@slack/bolt';

export function helloHandler(app: App): void {
  app.message('hello', async ({ message, say }) => {
    console.log('message', message);
    if ('user' in message) {
      console.log('user', message.user);
      await say(`Hey there <@${message.user}>`);
    }
  });
}
