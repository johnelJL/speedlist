const { categoryFields } = require('../categoryFields.js');


  'Do not repeat any information in the description that is already present in structured fields.'

const defaultCreatePrompts = [

  
];

const defaultSearchPrompts = [

  'You are a structured search assistant.',

  'Use the provided photos and user prompt to infer as much information as possible.',

  'Identify the category and subcategory first, then extract only the relevant listing fields that apply to them.',

  'When searching, include only fields with non-null values.',

  'Exclude any field that is null or unknown.',

  'Return only the extracted data. Avoid explanations or commentary.'

];

module.exports = { defaultCreatePrompts, defaultSearchPrompts };
