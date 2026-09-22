import { validateXML } from 'xsd-schema-validator';

import { expect } from 'chai';

import {
  createModdle,
  readFile
} from '../../helper.js';

const xsd = 'resources/dmn/xsd/DMN15.xsd';


/**
 * useAlternativeInputDataShape, which DMN 1.5 states in two places that disagree.
 *
 * The normative XSD carries it on DMNDiagram, as an optional xsd:boolean defaulting
 * to false. Table 97 lists it among the DMNShape attributes and describes it per
 * shape: "If the DMNShape depicts an Input Data element then it is represented
 * either using the paper sheet symbol ... or using the backwards compatible oval
 * symbol".
 *
 * Neither is a misreading, so documents exist both ways. Both are declared, so a
 * reader of either keeps what its author wrote — which is the whole job of a
 * descriptor. What it cannot do is make the two interchangeable: only the XSD's
 * spelling validates, and the test below says so rather than quietly skipping it.
 */
describe('dmn-moddle - DMN 1.5 useAlternativeInputDataShape', function() {

  this.timeout(30000);

  async function roundtrip(fixture) {
    const moddle = createModdle(undefined, { dmnVersion: '1.5' });

    const {
      rootElement: definitions,
      warnings
    } = await moddle.fromXML(readFile(fixture), 'dmn:Definitions');

    expect(warnings, JSON.stringify(warnings, null, 2)).to.be.empty;

    const { xml } = await moddle.toXML(definitions, { format: true });

    return { definitions, xml };
  }


  it('reads and writes it on the diagram, as the XSD has it', async function() {

    // when
    const { definitions, xml } = await roundtrip(
      'test/fixtures/dmn15/alternative-input-data-shape.dmn');

    // then
    // a boolean, not a string and not an unclaimed attribute carried along verbatim
    const diagram = definitions.dmnDI.diagrams[ 0 ];

    expect(diagram.useAlternativeInputDataShape).to.be.true;
    expect(xml).to.include('useAlternativeInputDataShape="true"');

    // and this spelling is the one the schema accepts
    await validateXML(xml, xsd);
  });


  it('reads and writes it on the shape, as Table 97 has it', async function() {

    // when
    const { definitions, xml } = await roundtrip(
      'test/fixtures/dmn15/alternative-input-data-shape-on-shape.dmn');

    // then
    const [ inputShape ] = definitions.dmnDI.diagrams[ 0 ].diagramElements;

    expect(inputShape.id).to.equal('DMNShape_Input_Age');
    expect(inputShape.useAlternativeInputDataShape).to.be.true;
    expect(xml).to.include(
      'dmnElementRef="Input_Age" useAlternativeInputDataShape="true"');

    // deliberately not validated against the XSD: this spelling does not validate,
    // and that is the point. The specification tells implementers to write it here
    // and its own schema refuses it. Declaring the property is what keeps such a
    // document's meaning through an edit; it cannot make the document conformant.
  });


  it('is a boolean on both, not the stereotype the UML model names', async function() {

    // given
    const moddle = createModdle(undefined, { dmnVersion: '1.5' });

    // then
    // left as generated, the property is an element of a Standard Profile type that
    // no document has, so the real attribute goes unclaimed and reads as unknown
    for (const type of [ 'dmndi:DMNDiagram', 'dmndi:DMNShape' ]) {
      const descriptor = moddle.getTypeDescriptor(type);

      // an effective descriptor names its properties with the package prefix
      const property = descriptor.properties.find(
        ({ name }) => name === 'dmndi:useAlternativeInputDataShape');

      expect(property, type).to.exist;
      expect(property.isAttr, type).to.be.true;
      expect(property.type, type).to.equal('Boolean');
    }
  });
});
