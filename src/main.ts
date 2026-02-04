import './style.css'
import { getIsLoggedIn, onLoginChange } from './fake-auth'

import type { AIChatFormSettings, JSONSchema, ToolFunction, FormField, InkeepJS, InkeepComponentProps } from '@inkeep/cxkit-types';

declare global {
  interface Window {
    Inkeep: InkeepJS;
  }
}

const escalationSchema: JSONSchema = {
  additionalProperties: false,
  description: 'Schema describing the answer confidence classification and its explanation.',
  properties: {
    answerConfidence: {
      description: 'A measure of how confidently the AI Assistant completely and directly answered the User Question.',
      oneOf: [
        {
          const: 'very_confident',
          description:
            'The AI Assistant provided a complete and direct answer to all parts of the User Question. The answer fully resolved the issue without requiring any further action from the User. Every part of the answer was cited from the information sources. The assistant did not ask for more information or provide options requiring User action. This is the highest Answer Confidence level and should be used sparingly.',
        },
        {
          const: 'somewhat_confident',
          description:
            'The AI Assistant provided a complete and direct answer to the User Question, but the answer contained minor caveats or uncertainties. Examples include asking follow-up questions, requesting additional information, suggesting uncertainty, or mentioning potential exceptions.',
        },
        {
          const: 'not_confident',
          description:
            'The AI Assistant tried to answer the User Question but did not fully resolve it. The assistant provided options requiring further action from the User, asked for more information, showed uncertainty, suggested contacting support, or provided an indirect or incomplete answer.',
        },
        {
          const: 'no_sources',
          description:
            'The AI Assistant did not use or cite any sources from the information sources to answer the User Question.',
        },
        {
          const: 'other',
          description: 'The User Question is unclear or unrelated to the subject matter.',
        },
      ],
      type: 'string',
    },
    explanation: {
      description: 'A brief few word justification of why a specific confidence level was chosen.',
      type: 'string',
    },
  },
  required: ['answerConfidence', 'explanation'],
  type: 'object',
};

const subscriptionField: FormField = {
  inputType: 'select',
  isRequired: true,
  label: 'Subscription',
  name: 'subscription',
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
        try {
          console.log(values);
          const payload = {
            conversation_id: conversation?.id,
            description: values?.description,
            email: values?.email,
            name: values?.name,
            subscription: values?.subscription,
          };
          console.log(payload);
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
      inputType: 'textarea',
      isRequired: true,
      label: 'Description',
      name: 'description',
    },
    {
      _type: 'include_chat_session',
      defaultValue: true,
      label: 'Include chat history',
      name: 'include_chat_session',
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
    // Optionally show the live chat button in the chat window
    // getHelpOptions: [
    //   {
    //     action: {
    //       formSettings: supportForm,
    //       type: 'open_form',
    //     },
    //     icon: { builtIn: 'LuUsers' },
    //     name: 'Open a support ticket',
    //   },
    // ],
    getTools: () => {
      return [
        {
          function: {
            description: 'Determine how confident the AI assistant was and whether or not to escalate to humans.',
            name: 'answerConfidence',

            parameters: escalationSchema,
          },
          renderMessageButtons: ({ args }: { args: { answerConfidence: string } }) => {
            const confidence = args?.answerConfidence;
            const fields = [...supportForm.fields];
            // if the user is logged in, show the subscription dropdown
            // TODO: Replace with actual call to check if the user is logged in
            if (getIsLoggedIn()) {
              fields.push(subscriptionField);
            }
            // if the answer confidence is not very confident, show a button that will open the support form to start a live chat
            if (['not_confident', 'no_sources', 'other'].includes(confidence)) {
              const action = {
                action: {
                  formSettings: { ...supportForm, fields },
                  type: 'open_form',
                },
                icon: { builtIn: 'LuUsers' },
                label: 'Open a support ticket',
              } as const;

              return [action];
            }

            return [];
          },
          type: 'function',
        } as unknown as ToolFunction<{ answerConfidence: string }>,
      ];
    },
  },
};

const chatButton = window.Inkeep?.ChatButton?.(config);


// Example of how to update the chat button when the user logs in or out
// onLoginChange((isLoggedIn) => {
//   if (isLoggedIn) {
//     console.log('user logged in');
//     const fields = [...supportForm.fields];
//     // add the subscription dropdown to the fields
//     fields.push(subscriptionField);
//     chatButton?.update({
//       aiChatSettings: {
//         getHelpOptions: [
//           {
//             action: {
//               formSettings: { ...supportForm, fields },
//               type: 'open_form',
//             },
//             icon: { builtIn: 'LuUsers' },
//             name: 'Open a support ticket',
//           },
//         ],
//       },

//     });
//   } else {
//     console.log('user logged out');
//     chatButton?.update({
//       aiChatSettings: {
//         getHelpOptions: [
//           {
//             action: {
//               formSettings: supportForm,
//               type: 'open_form',
//             },
//             icon: { builtIn: 'LuUsers' },
//             name: 'Open a support ticket',
//           },
//         ],
//       },
//     });
//   }
// });