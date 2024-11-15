import { signal } from '../../../deps/htm-preact.js';

export const currentStep = signal(1);
export const project = signal(null);
export const locales = signal([]);
export const localeRegion = signal([]);
export const selectedLocale = signal([]);

export function nextStep() {
  currentStep.value += 1;
}

export function prevStep() {
  currentStep.value -= 1;
}

export function setProject(_project) {
  console.log('setting project:', _project);
  project.value = {
    ...project.value,
    ..._project,
  };
}

export function reset() {
  currentStep.value = 1;
  project.value = null;
}

export async function fetchLocaleDetails() {
  const resp = await fetch(
    `https://main--milo--adobecom.hlx.page/.milo/config.json`
  );
  console.log('Response', resp);

  if (!resp.ok) {
    const errorText = await resp.text(); // Get the error message if available
    return { error: errorText };
  }

  const localeData = await resp.json(); // Parse the response as JSON
  console.log(localeData);
  locales.value = localeData.locales.data;
  localeRegion.value = localeData.localegroups.data;
}
