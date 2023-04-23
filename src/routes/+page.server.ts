// src/routes/+page.server.ts

import { Configuration, OpenAIApi } from 'openai';
import { SECRET_OPENAI_API_KEY } from '$env/static/private';
import { Readable } from 'node:stream';
import type { Actions } from './$types';
import { text } from '@sveltejs/kit';

import fs from 'fs';

const x1 = 'Patient had a significant amount of ceremen in the ear canal. I removed it';
const x2 = `Is there anything missing from this procedural note that would make it more complete to code:${x1}`;
const x3 = 'It was their right ear.';
const x4 = `combine the original stament: ${x1} with the ammended statement: ${x3} to make a complete original statment`;
let y1 = '';
const y3 =
	'Pretend you are world class icd-10 medical coder. please code this the best you can icd-10 procedure standards:';

export const actions: Actions = {
	dictation: async ({ request, event }: any) => {
		const configuration = new Configuration({
			apiKey: SECRET_OPENAI_API_KEY
		});
		const openai = new OpenAIApi(configuration);
		console.log(request, request.body);
		console.log(event);
		const data = await request.formData();
		console.log(data);
		const audioFile = data.get('dataFile');
		const fileStream = Readable.from(Buffer.from(await audioFile.arrayBuffer()));
		fileStream.path = 'audio.webm';
		// console.log(audioFile);
		// const audioReadStream = Readable.from(audioFile);
		// audioReadStream.path = 'dictation.wav';
		// fs.writeFileSync('/tmp/dictation.webm', audioFile);
		const resp = await openai.createTranscription(fileStream as unknown as File, 'whisper-1');
		console.log(resp);
		return {
			response: resp.data.text
		};
	},
	submitInitial: async ({ request }: any) => {
		const configuration = new Configuration({
			apiKey: SECRET_OPENAI_API_KEY
		});

		const openai = new OpenAIApi(configuration);
		console.log('here', openai);
		const textResponse = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: x2,
			temperature: 0.9,
			max_tokens: 3000
		});
		console.log(textResponse);
		return {
			response:
				'The best ICD-10 code for the given procedural note would be 09B - Excision. However, additional information is needed to code it more accurately, such as the specific body part (external auditory canal, middle ear, etc.)'
		};
	},
	submitAddendum: async ({ request }: any) => {
		const configuration = new Configuration({
			apiKey: SECRET_OPENAI_API_KEY
		});

		const openai = new OpenAIApi(configuration);
		console.log('here', openai);
		const textResponse = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: x4,
			temperature: 0.9,
			max_tokens: 3000
		});
		y1 = textResponse.data.choices[0].text as string;
		return {
			response: textResponse.data.choices[0].text
		};
	},
	submitCodeQuery: async ({ request }: any) => {
		const configuration = new Configuration({
			apiKey: SECRET_OPENAI_API_KEY
		});

		const openai = new OpenAIApi(configuration);
		console.log('here', openai);
		const textResponse = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: `${y3}: ${y1}`,
			temperature: 0.9,
			max_tokens: 3000
		});
		return {
			response: textResponse.data.choices[0].text
		};
	}
};
