'use strict';

const Wit = require('node-wit').Wit;
const myActions = require('./my-wit-actions');
const session = require('./session.js');

/**
 * Handles wit.ai integration
 * @param event
 */
const init = event => new Promise((resolveMessage, rejectMessage) => {
  if (event.sender && event.sender.id && event.message && event.message.text) {
    const sessionId = `${event.id}-${event.updated}`;
    const actions = {
      send: (request, response) => new Promise(() => {
        session.writeSession(Object.assign({ id: event.id, updated: event.updated }, { context: request.context }))
          .then(() => resolveMessage(response));
      })
    };
    // Copy custom actions to actions

    const combinedActions = Object.assign({}, actions, myActions);
    const client = new Wit({
      accessToken: process.env.WIT_AI_TOKEN,
      actions: combinedActions
    });

    client.runActions(sessionId, event.message.text, Object.assign({}, event.context))
      .catch(err => console.error(err));
  } else {
    rejectMessage('wit ai failed');
  }
});

module.exports = init;
