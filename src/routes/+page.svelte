<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import AudioRecorder from '../components/AudioRecorder.svelte';

	let recordedAudioBlob: Blob;

	let answerInitial = '';
	let answerAddendum = '';
	let codedAnswer = '';
	let loading = false;

	function audioRecorded(e) {
		console.log(e);
		recordedAudioBlob = e.detail.data;
	}

	const handleSubmit: SubmitFunction = () => {
		loading = true;

		return async ({ action, result }) => {
			let resultObject = JSON.parse(JSON.stringify(result));

			if (action.search == '?/submitInitial') {
				if (resultObject.status == 200) {
					if (resultObject.data.response) {
						answerInitial = resultObject.data.response;
					}
					loading = false;
				} else {
					loading = false;
					alert('An error occurred, please try again.');
				}
			}
			if (action.search == '?/submitAddendum') {
				if (resultObject.status == 200) {
					if (resultObject.data.response) {
						answerAddendum = resultObject.data.response;
					}
					loading = false;
				} else {
					loading = false;
					alert('An error occurred, please try again.');
				}
			}
			if (action.search == '?/submitCodeQuery') {
				if (resultObject.status == 200) {
					if (resultObject.data.response) {
						codedAnswer = resultObject.data.response;
					}
					loading = false;
				} else {
					loading = false;
					alert('An error occurred, please try again.');
				}
			}
		};
	};

	function uploadAudio() {
		console.log('uploading audio...');
		const formData = new FormData();
		formData.append('damName', 'something');
		formData.append('dataFile', recordedAudioBlob);
		const upload = fetch('/?/dictation', {
			method: 'POST',
			body: formData
		})
			.then((response) => response.json())
			.then((result) => {
				console.log('Success:', result);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
</script>

<AudioRecorder on:audio-recorded={audioRecorded} />

<!-- <box id="form-box" class="box">
	<h2 class="subtitle"><b>Initial Dr. Dictation:</b></h2>
	<div class="field">
		<div class="control">
			<button on:click={uploadAudio} type="submit" class="button is-success is-fullwidth"
				><b>Submit initial dictation</b></button
			>
		</div>
	</div>
</box> -->

<box id="form-box" class="box">
	<h2 class="subtitle"><b>Initial Dr. Dictation:</b></h2>
	<form
		action="?/submitInitial"
		method="POST"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
		id="upload"
		name="upload"
	>
		<div class="field">
			<div class="control">
				<button type="submit" class="button is-success is-fullwidth"
					><b>Submit initial dictation</b></button
				>
			</div>
		</div>
	</form>
</box>
{#if answerInitial != ''}
	<box class="box">
		<h2 class="subtitle"><b>Bot Response</b></h2>
		<p>{answerInitial}</p>
	</box>
{/if}
<box id="form-box" class="box">
	<h2 class="subtitle"><b>Dr. Addendum</b></h2>
	<form
		action="?/submitAddendum"
		method="POST"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
		id="upload"
		name="upload"
	>
		<div class="field">
			<div class="control">
				<button type="submit" class="button is-success is-fullwidth"><b>Submit Addendum</b></button>
			</div>
		</div>
	</form>
</box>
{#if answerAddendum != ''}
	<box class="box">
		<h2 class="subtitle"><b>Text Response</b></h2>
		<p>{answerAddendum}</p>
	</box>
{/if}
<box id="form-box" class="box">
	<h2 class="subtitle"><b>Coded Response</b></h2>
	<form
		action="?/submitCodeQuery"
		method="POST"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
		id="upload"
		name="upload"
	>
		<div class="field">
			<div class="control">
				<button type="submit" class="button is-success is-fullwidth"><b>Code the prompt</b></button>
			</div>
		</div>
	</form>
</box>
{#if answerAddendum != ''}
	<box class="box">
		<h2 class="subtitle"><b>Text Response</b></h2>
		<p>{codedAnswer}</p>
	</box>
{/if}
