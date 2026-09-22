const fs = require('node:fs');

const {
  findProperty,
  findType,
  fixSequence,
  parseXML,
  removeProperty,
  removeWhitespace
} = require('./helper.cjs');

module.exports = async function(results, options = {}) {
  const { elementsByType } = results;

  let model = elementsByType[ 'uml:Package' ][ 0 ];

  // remove associations
  model.associations = [];

  // remove DC and DI
  model.types = model.types.filter(({ name }) => {
    return name && !name.includes(':');
  });

  model.enumerations = model.enumerations.filter(({ name }) => {
    return name && !name.includes(':');
  });

  // fix super class of DMNStyle
  findType('DMNStyle', model).superClass = [ 'di:Style' ];

  // reverse order of DMNEdge superclasses
  findType('DMNEdge', model).superClass.reverse();

  // fix DMNLabel
  const text = findProperty('DMNLabel#text', model);

  delete text.isAttr;

  text.type = 'Text';

  model.types.push({
    name: 'Text',
    properties: [ {
      name: 'text',
      isBody: true,
      type: 'String'
    } ]
  });

  removeProperty('DMNStyle#id', model);

  // fix dmndi:DMNDiagram#sharedStyle and dmndi:DMNDiagramElement#sharedStyle
  // by redefining di:DiagramElement#sharedStyle
  findProperty('DMNDiagram#sharedStyle', model).redefines = 'di:DiagramElement#sharedStyle';
  findProperty('DMNDiagramElement#sharedStyle', model).redefines = 'di:DiagramElement#sharedStyle';

  // fix dmndi:DMNDiagram#dmnElementRef and dmndi:DMNDiagramElement#dmnElementRef type prefix
  findProperty('DMNDiagram#dmnElementRef', model).type = 'dmn:DMNElement';
  findProperty('DMNDiagramElement#dmnElementRef', model).type = 'dmn:DMNElement';

  // add dmndi:Size and change dmndi:DMNDiagram#size type to that
  model.types.push({
    name: 'Size',
    superClass: [
      'dc:Dimension'
    ]
  });
  findProperty('DMNDiagram#size', model).type = 'Size';

  // fix dmndi:useAlternativeInputDataShape, which DMN 1.5 states in two places that
  // do not agree.
  //
  // The normative XSD carries it on DMNDiagram, as an optional xsd:boolean defaulting
  // to false. Table 97 lists it among the DMNShape attributes instead, and describes
  // it per shape: "If the DMNShape depicts an Input Data element then it is
  // represented either using the paper sheet symbol ... or using the backwards
  // compatible oval symbol". Neither reading is a misreading, so documents exist both
  // ways, and it is declared in both places here. A presentation hint costs nothing
  // twice, and a reader of either spelling keeps what its author wrote.
  //
  // It is an attribute in both. The UML model types it as an association to a
  // Standard Profile stereotype, which is an artefact of the OMG's own export rather
  // than anything the schema means; left alone, moddle looks for a child element that
  // no document has, and the real attribute goes unclaimed.
  //
  // Absent before DMN 1.5, so this is a no-op for the 1.3 model.
  const alternativeInputDataShape =
    findProperty('DMNDiagram#useAlternativeInputDataShape', model);

  if (alternativeInputDataShape) {
    alternativeInputDataShape.isAttr = true;
    alternativeInputDataShape.type = 'Boolean';

    findType('DMNShape', model).properties.push({
      name: 'useAlternativeInputDataShape',
      isAttr: true,
      type: 'Boolean'
    });
  }

  model = removeWhitespace(model);

  const xsdPath = options.xsdFile || 'resources/dmn/xsd/DMNDI13.xsd';
  const file = fs.readFileSync(xsdPath, 'utf8');

  const xsd = await parseXML(file);

  model = fixSequence(model, xsd);

  // set uri
  model.uri = xsd.elementsByTagName[ 'xsd:schema' ][ 0 ].targetNamespace;

  return model;
};
