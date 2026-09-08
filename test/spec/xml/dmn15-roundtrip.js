import { expect } from 'chai';

import {
  createModdle,
  readFile
} from '../../helper.js';

const fixture = 'test/fixtures/dmn15/decision-table.dmn';


describe('dmn-moddle - DMN 1.5 roundtrip', function() {

  it('imports, writes and re-imports a typed DMN 1.5 decision table with DMNDI', async function() {
    const moddle = createModdle(undefined, { dmnVersion: '1.5' });

    const {
      rootElement: definitions,
      warnings
    } = await moddle.fromXML(readFile(fixture), 'dmn:Definitions');

    expect(warnings).to.be.empty;
    expect(definitions.$type).to.equal('dmn:Definitions');

    const decision = definitions.drgElement.find(element => element.id === 'Decision_Eligibility');

    expect(decision).to.exist;
    expect(decision.$type).to.equal('dmn:Decision');
    expect(decision.decisionLogic.$type).to.equal('dmn:DecisionTable');
    expect(definitions.dmnDI.$type).to.equal('dmndi:DMNDI');

    const { xml } = await moddle.toXML(definitions, { format: true });

    expect(xml).to.include('https://www.omg.org/spec/DMN/20230324/MODEL/');
    expect(xml).to.include('https://www.omg.org/spec/DMN/20230324/DMNDI/');
    expect(xml).to.include('DMNShape_Decision_Eligibility');
    expect(xml).to.include('DMNEdge_InformationRequirement_Age');

    const {
      rootElement: reimported,
      warnings: reimportWarnings
    } = await moddle.fromXML(xml, 'dmn:Definitions');

    expect(reimportWarnings).to.be.empty;
    expect(reimported.$type).to.equal('dmn:Definitions');

    const reimportedDecision = reimported.drgElement.find(element => element.id === 'Decision_Eligibility');

    expect(reimportedDecision.decisionLogic.$type).to.equal('dmn:DecisionTable');
    expect(reimported.dmnDI.$type).to.equal('dmndi:DMNDI');
  });
});
