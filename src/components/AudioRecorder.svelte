<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let microphoneButton: HTMLElement;
	let stopButton: HTMLElement;
	let audioElement: HTMLAudioElement;
	let audioElementSource: HTMLSourceElement;

	let audioMimeType: string;
	let recordedAudioBlob: Blob | null = null;

	let audioBlobs: Blob[] = [];
	let mediaRecorder: MediaRecorder | null = null;
	let streamBeingCaptured: MediaStream | null = null;

	function displayAudioRecordedEvent() {
		dispatch('audio-recorded', {
			data: recordedAudioBlob,
			mimeType: audioMimeType
		});
	}

	function start() {
		//Feature Detection
		if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
			//Feature is not supported in browser
			//return a custom error
			alert('mediaDevices API or getUserMedia method is not supported in this browser.');
			return Promise.reject(
				new Error('mediaDevices API or getUserMedia method is not supported in this browser.')
			);
		} else {
			//Feature is supported in browser
			//...
			navigator.mediaDevices
				.getUserMedia({ audio: true } /*of type MediaStreamConstraints*/)
				//returns a promise that resolves to the audio stream
				.then((stream) /*of type MediaStream*/ => {
					//save the reference of the stream to be able to stop it when necessary
					streamBeingCaptured = stream;

					//create a media recorder instance by passing that stream into the MediaRecorder constructor
					mediaRecorder = new MediaRecorder(
						stream
					); /*the MediaRecorder interface of the MediaStream Recording
                    API provides functionality to easily record media*/

					//clear previously saved audio Blobs, if any
					audioBlobs = [];

					//add a dataavailable event listener in order to store the audio data Blobs when recording
					mediaRecorder.addEventListener('dataavailable', (event) => {
						//store audio Blob object
						audioBlobs.push(event.data);
					});

					//start the recording by calling the start method on the media recorder
					mediaRecorder.start();
				});
		}
	}

	function stop() {
		if (mediaRecorder !== null) {
			let mimeType = mediaRecorder.mimeType;

			//listen to the stop event in order to create & return a single Blob object
			mediaRecorder.addEventListener('stop', () => {
				//create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
				let audioBlob = new Blob(audioBlobs, { type: mimeType });
				console.log({ mimeType });

				//resolve promise with the single audio blob representing the recorded audio
				audioMimeType = mimeType;
				recordedAudioBlob = audioBlob;
				displayAudioRecordedEvent();
			});
			cancel();
		}
	}

	function cancel() {
		//stop the recording feature
		if (mediaRecorder !== null) {
			mediaRecorder.stop();
		}

		//stop all the tracks on the active stream in order to stop the stream
		stopStream();

		//reset API properties for next recording
		resetRecordingProperties();
	}

	function stopStream() {
		if (streamBeingCaptured === null) return;
		streamBeingCaptured
			.getTracks() //get all tracks from the stream
			.forEach((track) /*of type MediaStreamTrack*/ => track.stop()); //stop each one
	}

	function resetRecordingProperties() {
		mediaRecorder = null;
		streamBeingCaptured = null;
	}

	function playAudio() {
		//read content of files (Blobs) asynchronously
		let reader = new FileReader();

		//once content has been read
		reader.onload = (e) => {
			//store the base64 URL that represents the URL of the recording audio
			let base64URL = e.target.result;

			//If this is the first audio playing, create a source element
			//as pre populating the HTML with a source of empty src causes error
			// const audioElementSource = audioElement.getElementsByTagName('source')[0];
			if (!audioElementSource) {
				//if its not defined create it (happens first time only)
				// createSourceForAudioElement();
				let sourceElement = document.createElement('source');
				audioElement.appendChild(sourceElement);

				audioElementSource = sourceElement;
			}

			//set the audio element's source using the base64 URL
			if (typeof base64URL === 'string') {
				audioElementSource.src = base64URL;
			} else {
				alert('Problem playing audio');
				return;
			}

			if (recordedAudioBlob) {
				//set the type of the audio element based on the recorded audio's Blob type
				let BlobType = recordedAudioBlob.type.includes(';')
					? recordedAudioBlob.type.substr(0, recordedAudioBlob.type.indexOf(';'))
					: recordedAudioBlob.type;
				audioElementSource.type = BlobType;

				//call the load method as it is used to update the audio element after changing the source or other settings
				audioElement.load();

				//play the audio after successfully setting new src and type that corresponds to the recorded audio
				console.log('Playing audio...');
				audioElement.play();

				//Display text indicator of having the audio play in the background
				// displayTextIndicatorOfAudioPlaying();
			}
		};

		//read content and convert it to a URL (base64)
		if (recordedAudioBlob) {
			reader.readAsDataURL(recordedAudioBlob);
		}
	}
</script>

<div class="audio-recording-container">
	<!-- recordedAudioBlob: {recordedAudioBlob}<br />
	audioBlobs: {audioBlobs}<br />
	mediaRecorder: {!!mediaRecorder};<br />
	streamBeingCaptured: {!!streamBeingCaptured};<br /> -->

	{#if !mediaRecorder}
		<i
			bind:this={microphoneButton}
			on:click={start}
			class="start-recording-button fa fa-microphone fa-10x"
			aria-hidden="true"
		/>
	{:else}
		<i
			bind:this={stopButton}
			on:click={stop}
			class="stop-recording-button fa fa-stop-circle-o fa-10x"
			aria-hidden="true"
		/>
	{/if}
	<div on:click={playAudio}>TEST PLAY AUDIO</div>
</div>
<!-- <div class="overlay hide">
	<div class="browser-not-supporting-audio-recording-box">
		<p>To record audio, use browsers like Chrome and Firefox that support audio recording.</p>
		<button type="button" class="close-browser-not-supported-box">Ok.</button>
	</div>
</div> -->

<audio bind:this={audioElement} controls style="display:none;" class="audio-element" />
