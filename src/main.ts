import './style.css'
import { onLoginChange } from './fake-auth'

import type { AIChatFormSettings, FormField, InkeepJS, InkeepComponentProps } from '@inkeep/cxkit-types';

declare global {
  interface Window {
    Inkeep: InkeepJS;
  }
}

const subscriptionField: FormField = {
  inputType: 'select',
  isRequired: true,
  label: 'Subscription',
  name: 'subscription',
  // TODO: Replace with actual subscription items
  items: [
    {
      label: 'Subscription 1',
      value: 'subscription_1',
    },
    {
      label: 'Subscription 2',
      value: 'subscription_2',
    },
  ],
};

const supportForm: AIChatFormSettings = {
  buttons: {
    close: {
      action: 'return_to_chat',
    },
    submit: {
      label: 'Create support ticket',
      onSubmit: async ({ values, conversation }) => {
        console.log('values', values);
        // values example:
        //   {
        //     "name": "Sarah",
        //     "email": "sarah@inkeep.com",
        //     "subscription": "subscription_1",
        //     "include_chat_session": true,
        //     "description": "Here is a description of my problem."
        // }
        console.log('conversation', conversation);
        // conversation example:
        // {
        //   id: "conv_123",
        //   type: "openai",
        //   createdAt: "2026-02-04T19:31:18.810Z",
        //   messages: [
        //     { role: "user", content: "how to reset my password" },
        //     { role: "assistant", content: "I don't have info about...", tool_calls: [...] }
        //   ],
        //   messagesOpenAIFormat: [
        //     { role: "user", content: "how to reset my password" },
        //     { role: "assistant", content: "...", tool_calls: [...] }
        //   ]
        // }
        try {
          const payload = {
            conversation_id: conversation?.id,
            description: values?.description,
            email: values?.email,
            name: values?.name,
            subscription: values?.subscription,
          };
          console.log('payload', payload);
          // payload example:
          //   {
          //     "conversation_id": "conv_123",
          //     "description": "Here is a description of my problem.",
          //     "email": "sarah@inkeep.com",
          //     "name": "Sarah",
          //     "subscription": "subscription_1"
          // }
          // TODO: Replace with actual call to create the support ticket
          const response = await new Promise<{ ok: boolean }>((resolve) => {
            setTimeout(() => resolve({ ok: true }), 500);
          });
          // here is an example of an API call to create a support ticket
          // const response = await fetch('https://your-api-endpoint.com/create-support-ticket', {
          //   method: 'POST',
          //   body: JSON.stringify(payload),
          // });
          if (!response.ok) {
            throw new Error('Failed to create support ticket');
          }
        } catch (error) {
          console.error('Failed to create support ticket', error);
          throw new Error('Failed to create support ticket.');
        }
      },
    },
  },
  description: 'Create a support ticket and someone on our team will get back to you shortly.',
  fields: [
    {
      inputType: 'text',
      isRequired: true,
      label: 'Name',
      name: 'name',
    },
    {
      inputType: 'email',
      isRequired: true,
      label: 'Email',
      name: 'email',
    },
    {
      _type: 'include_chat_session',
      defaultValue: true,
      label: 'Include chat history',
      name: 'include_chat_session',
    },
    {
      inputType: 'textarea',
      isRequired: true,
      label: 'Description',
      name: 'description',
    },
  ],
  heading: 'Create support ticket',
  successView: {
    doneButton: {
      action: 'return_to_chat',
      label: 'Close',
    },
    heading: 'Request Submitted',
    message: "We'll get back to you shortly.",
  },
};

const config: InkeepComponentProps = {
  baseSettings: {
    apiKey: import.meta.env.VITE_INKEEP_API_KEY,
    organizationDisplayName: "Your Company",
    primaryBrandColor: "#4F46E5",
  },
  aiChatSettings: {
    getHelpOptions: [
      {
        action: {
          formSettings: supportForm,
          type: 'open_form',
        },
        icon: { builtIn: 'LuUsers' },
        name: 'Open a support ticket',
      },
    ],
  },
};

const chatButton = window.Inkeep?.ChatButton?.(config);


onLoginChange((isLoggedIn) => {
  if (isLoggedIn) {
    console.log('user logged in');
    const fields = [...supportForm.fields];
    // insert the subscription dropdown after the email field
    const emailIndex = fields.findIndex(f => f.name === 'email');
    fields.splice(emailIndex + 1, 0, subscriptionField);
    chatButton?.update({
      aiChatSettings: {
        getHelpOptions: [
          {
            action: {
              formSettings: { ...supportForm, fields },
              type: 'open_form',
            },
            icon: { builtIn: 'LuUsers' },
            name: 'Open a support ticket',
          },
        ],
      },

    });
  } else {
    console.log('user logged out');
    chatButton?.update({
      aiChatSettings: {
        getHelpOptions: [
          {
            action: {
              formSettings: supportForm,
              type: 'open_form',
            },
            icon: { builtIn: 'LuUsers' },
            name: 'Open a support ticket',
          },
        ],
      },
    });
  }
});