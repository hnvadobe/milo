import { html, useState } from '../../../deps/htm-preact.js';
import { nextStep, project, setProject } from './state.js';
import StepControls from './stepControls.js';
import { showFragments } from '../components/fragment-modal/index.js';

export default function InputUrls() {
  const [formData, setFormData] = useState(
    project.value || {
      name: '',
      localisationFlow: false,
      editBehavior: 'skip',
      urls: '',
      includeFragments: false,
    }
  );
  const [fragmentTextarea, setFragmentTextarea] = useState(false)
  const [fragments, setFragments] = useState('')
  const errorPresent = false

  function handleFormInput(event) {
    const { name, value } = event.target;
    console.log('formInput', name, value);
    setFormData({ ...formData, [name]: value });
  }

  function handleFragmentInput(event) {
    const { name, value } = event.target;
    console.log('formInput', name, value); 
    setFragments(value)
  }

  function handleFormToggle(event) {
    const { name } = event.target;
    console.log('formToggle', name);
    setFormData({ ...formData, [name]: !formData[name] });
    setFragmentTextarea(!fragmentTextarea)
  }

  function handleNext(errorPresent) {
    if(errorPresent) return;
    else {
      setProject(formData);
      nextStep();
    }
  }

  return html`
    <div>
      <div class="locui-title-bar">Localization</div>

      <div class="field-row">
        <span class="field-label">Enter Project Name</span>
        <input name="name" value=${formData.name} onInput=${handleFormInput} />
      </div>

      <div class="field-row">
        <span class="field-label">HTML Localization Flow</span>
        <input
          type="checkbox"
          name="localisationFlow"
          checked=${formData.localisationFlow}
          onClick=${handleFormToggle}
        />
      </div>

      <div class="field-row">
        <span class="field-label">Regional Edit Behavior</span>
        <select
          name="editBehavior"
          value=${formData.editBehavior}
          onChange=${handleFormInput}
        >
          <option value="skip">Skip</option>
          <option value="merge">Merge</option>
          <option value="override">Override</option>
        </select>
      </div>

      <div class="field-col">
        <div class="row">
          <span class="field-label">Enter the URL's</span>
          <span class="field-desc"
            >(For multile URLs, enter each one on new line. Maximum number of
            URLs can be entered is 150)</span
          >
        </div>

        <textarea
          class="locui-textarea"
          rows="10"
          name="urls"
          value=${formData.urls}
          onInput=${handleFormInput}
        />
      </div>

      <div class="field-row">
        <input
          type="checkbox"
          name="includeFragments"
          onClick=${handleFormToggle}
        />
        <span class="field-label pl-8">Include Fragments</span>
      </div>

      <div class="field-col">
        ${fragmentTextarea && (
        html`
        <textarea
            class="locui-textarea"
            rows="10"
            name="fragments"
            value=${fragments}
            onInput=${handleFragmentInput}
        />
        <p>Invalid fragments <a href="#" onClick=${() => showFragments()}>view details</a></p>
        `
        )}
        
      </div>
 
      <!-- set enable based on the errors present -->
      <${StepControls} enable=${!errorPresent} onNext=${() => handleNext(errorPresent)} />
    </div>
  `;
}
