import en from "../locales/en.json";
// import de from "../lang/de";
// import fr from "../lang/fr";
import es from "../locales/es.json";

export const lang = (value) => {
  const lang = JSON.parse(localStorage.getItem("languageSet"))
    ? JSON.parse(localStorage.getItem("languageSet"))
    : { value: "en", label: "English" };

  switch (lang.value) {
    case "en":
      return Capitalize(en[value] || value);
    // case "de":
    //   return de[value] || value;
    // case "fr":
    //   return fr[value] || value;
    case "es":
      return Capitalize(es[value] || value);
    default:
      return Capitalize(value);
  }
};

export function Capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default lang;
