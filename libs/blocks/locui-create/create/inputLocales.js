import { html, useEffect, useState, signal } from '../../../deps/htm-preact.js';
import {
  nextStep,
  prevStep,
  fetchLocaleDetails,
  locales,
  localeRegion,
  project,
} from './state.js';
import StepControls from './stepControls.js';

export default function InputLocales() {
  const errorPresent = signal(false);
  const [selectedRegion, setSelectedRegion] = useState({}); // Track selected regions
  const [selectedLocale, setSelectedLocale] = useState([]); // Track selected locales
  const [activeLocales, setActiveLocales] = useState({}); // Track active locales with associated languages

  useEffect(() => {
    async function loadLocaleDetails() {
      const result = await fetchLocaleDetails();
      if (result.error) {
        errorPresent.value = true;
        console.error('Error fetching locale details:', result.error);
      }
    }

    loadLocaleDetails();
  }, []);

  // Synchronize selectedRegion based on selectedLocale
  useEffect(() => {
    const updatedRegionStates = { ...selectedRegion };

    localeRegion.value.forEach((region) => {
      const regionLocales = region.value.split(',');

      // Check if region button should still be active after the locale update
      const isRegionActive = regionLocales.every((locale) =>
        selectedLocale.includes(locale)
      );

      updatedRegionStates[region.key] = isRegionActive;
    });

    setSelectedRegion(updatedRegionStates); // Update the region button states
  }, [selectedLocale]);

  function handleNext() {
    if (errorPresent.value) return;
    nextStep();
  }

  function handleBack() {
    prevStep();
  }

  function resetSelection() {
    setSelectedRegion({}); // Reset selected regions
    setSelectedLocale([]); // Reset selected locales
    setActiveLocales({}); // Reset active locales
  }

  // Handle region selection
  function toggleRegion(region) {
    const regionCountryCodes = region.value.split(',');

    if (selectedRegion[region.key]) {
      // Region is currently selected; deselect it
      const { [region.key]: _, ...updatedSelectedRegion } = selectedRegion;
      setSelectedRegion(updatedSelectedRegion);

      // Remove region's codes from selectedLocale
      setSelectedLocale((prevSelectedLocale) =>
        prevSelectedLocale.filter(
          (localeCode) => !regionCountryCodes.includes(localeCode)
        )
      );

      // Remove region's locales from activeLocales
      setActiveLocales((prevActiveLocales) => {
        const updatedActiveLocales = { ...prevActiveLocales };
        regionCountryCodes.forEach((locale) => {
          delete updatedActiveLocales[locale]; // Remove the locale and its associated language
        });
        return updatedActiveLocales;
      });
    } else {
      // Region is not selected; add it
      setSelectedRegion({
        ...selectedRegion,
        [region.key]: region.value.split(',').reduce((acc, locale) => {
          acc[locale] = true;
          return acc;
        }, {}),
      });

      // Add region's codes to selectedLocale if not already present
      setSelectedLocale((prevSelectedLocale) => [
        ...prevSelectedLocale,
        ...regionCountryCodes.filter(
          (code) => !prevSelectedLocale.includes(code)
        ),
      ]);

      // Add region's locales to activeLocales
      setActiveLocales((prevActiveLocales) => {
        const updatedActiveLocales = { ...prevActiveLocales };
        regionCountryCodes.forEach((locale) => {
          // Find the language for each locale and store it
          const language = locales.value.find((lang) =>
            lang.livecopies.split(',').includes(locale)
          );
          if (language) {
            updatedActiveLocales[locale] = language.language;
          }
        });
        return updatedActiveLocales;
      });
    }
  }

  // Toggle language selection based on livecopies matching selected region values
  function selectLanguage(lang) {
    const languageCodes = lang.livecopies.split(',');

    // Step 1: Toggle language selection (add or remove locales from selectedLocale)
    setSelectedLocale((prevSelectedLocale) => {
      let newSelectedLocale;

      // If language is already selected, remove it (deselect)
      if (languageCodes.every((code) => prevSelectedLocale.includes(code))) {
        newSelectedLocale = prevSelectedLocale.filter(
          (locale) => !languageCodes.includes(locale) // Remove the deselected locales
        );
      } else {
        // If language is not selected, add it (select)
        newSelectedLocale = [...prevSelectedLocale, ...languageCodes];
      }

      // Update activeLocales based on selected language
      setActiveLocales((prevActiveLocales) => {
        const updatedActiveLocales = { ...prevActiveLocales };
        languageCodes.forEach((locale) => {
          // If this locale is being selected, associate it with the language
          if (newSelectedLocale.includes(locale)) {
            updatedActiveLocales[locale] = lang.language;
          } else {
            delete updatedActiveLocales[locale]; // Remove from activeLocales if deselected
          }
        });
        return updatedActiveLocales;
      });

      return newSelectedLocale;
    });

    // After selecting or deselecting, update the active state of the regions
    const updatedRegionStates = { ...selectedRegion };

    localeRegion.value.forEach((region) => {
      const regionLocales = region.value.split(',');

      const isRegionActive = regionLocales.every((locale) =>
        selectedLocale.includes(locale)
      );

      updatedRegionStates[region.key] = isRegionActive;
    });

    setSelectedRegion(updatedRegionStates);
  }

  function toggleLocale(locale) {
    console.log('Toggling Locale:', locale);

    setActiveLocales((prevActiveLocales) => {
      const updatedActiveLocales = { ...prevActiveLocales };
      if (updatedActiveLocales[locale]) {
        // If the locale is already active, remove it (deactivate it)
        delete updatedActiveLocales[locale];
      } else {
        // If the locale is not active, add it (activate it)
        // Find associated language and add it
        const language = locales.value.find((lang) =>
          lang.livecopies.split(',').includes(locale)
        );
        if (language) {
          updatedActiveLocales[locale] = language.language;
        }
      }
      return updatedActiveLocales;
    });
  }

  // The function to render selected locales with language names
  const renderSelectedLocalesWithLanguages = () => {
    console.log('activeLocales', activeLocales); // This should show the current state of activeLocales

    // Group locales by their language
    const groupedLocales = selectedLocale.reduce((acc, locale) => {
      const language = locales.value.find((lang) =>
        lang.livecopies.split(',').includes(locale)
      );

      if (language) {
        if (!acc[language.language]) {
          acc[language.language] = [];
        }
        acc[language.language].push(locale);
      }
      return acc;
    }, {});

    // Render the grouped locales
    return Object.keys(groupedLocales).map((languageName) => {
      const localesInLanguage = groupedLocales[languageName];

      return html`
        <div class="locale-group">
          <p><strong>${languageName}</strong></p>
          <div class="locale-button-container">
            ${localesInLanguage.map(
              (locale) => html`
                <button
                  class="locale-button ${activeLocales[locale] ? 'active' : ''}"
                  onClick=${() => toggleLocale(locale)}
                >
                  ${locale.toUpperCase()}
                </button>
              `
            )}
          </div>
        </div>
      `;
    });
  };

  // Render locale buttons based on selected locales
  return html`
    <div>
      <span>Project Name: ${project.value.name || 'n/a'}</span>
    </div>
    <div class="region-grid">
      <p>Quick Select for Language/Locale</p>
      <div class="region-buttons">
        ${localeRegion.value.map(
          (region) => html`
            <button
              key=${region.key}
              class="region-button ${selectedRegion[region.key]
                ? 'active'
                : ''}"
              onClick=${() => toggleRegion(region)}
            >
              ${region.key}
            </button>
          `
        )}
        <button class="reset-button" onClick=${resetSelection}>
          Reset All
        </button>
      </div>
    </div>

    <!-- Language Grid -->
    <div class="language-grid">
      <p>Select the Language(s)</p>
      <div class="language-buttons">
        ${locales.value.map(
          (language) =>
            language.livecopies.length > 0 &&
            html`
              <button
                key=${language.languagecode}
                class="language-button ${language.livecopies
                  .split(',')
                  .some((locale) => selectedLocale.includes(locale))
                  ? 'active'
                  : ''}"
                onClick=${() => selectLanguage(language)}
              >
                ${language.language}
              </button>
            `
        )}
      </div>
    </div>

    <!-- Locale Grid -->
    ${selectedLocale.length > 0 &&
    html`
      ${selectedLocale.length > 0 &&
      html`
        <div class="locale-grid">
          <p>Select Locales</p>
          <div class="locale-container">
            ${renderSelectedLocalesWithLanguages()}
          </div>
        </div>
      `}
    `}

    <${StepControls}
      enable=${!errorPresent.value}
      onNext=${handleNext}
      onBack=${handleBack}
    />
  `;
}
