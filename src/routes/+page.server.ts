// src/routes/+page.server.ts

import { Configuration, OpenAIApi } from 'openai';
import { SECRET_OPENAI_API_KEY } from '$env/static/private';
import type { Actions } from './$types';
import { text } from '@sveltejs/kit';

const x1 = "Patient had a significant amount of ceremen in the ear canal. I removed it"
const x2 = `Is there anything missing from this procedural note that would make it more complete to code:${x1}`
const x3 = "I used a spoon"
const x4 = `combine the original stament: ${x1} with the ammended statement: ${x3} to make a complete original statment`
let y1 = "";
const y3 = "Pretend you are world class icd-10 medical coder. please code this the best you can icd-10 procedure standards:"

export const actions: Actions = {
  submitInitial: async ({ request } : any) => {        
        const configuration = new Configuration({
            apiKey: SECRET_OPENAI_API_KEY,
        });

        const openai = new OpenAIApi(configuration);
        console.log('here', openai)
        const textResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: x2,
            temperature: .9,
            max_tokens: 3000,
        });
        console.log(textResponse)
        return {
            response: textResponse.data.choices[0].text,
        }
    },
    submitAddendum: async ({ request } : any) => {        
      const configuration = new Configuration({
          apiKey: SECRET_OPENAI_API_KEY,
      });

      const openai = new OpenAIApi(configuration);
      console.log('here', openai)
      const textResponse = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: x4,
          temperature: .9,
          max_tokens: 3000,
      });
      y1 = textResponse.data.choices[0].text as string
      return {
          response: textResponse.data.choices[0].text,
      }
  },
  submitCodeQuery: async ({ request } : any) => {        
    const configuration = new Configuration({
        apiKey: SECRET_OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);
    console.log('here', openai)
    const textResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${y3}: ${y1}`,
        temperature: .9,
        max_tokens: 3000,
    });
    return {
        response: textResponse.data.choices[0].text,
    }
},
}