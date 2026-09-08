import { validateXML } from 'xsd-schema-validator';

import { expect } from 'chai';

import {
  createModdle,
  readFile
} from '../../helper.js';

const xsd = 'resources/dmn/xsd/DMN15.xsd';

function findElement(definitions, id) {
  return definitions.drgElement.find(element => element.id === id);
}

function assertContext(definitions) {
  const decision = findElement(definitions, 'Decision_Score');

  expect(decision.decisionLogic.$type).to.equal('dmn:Context');
  expect(decision.decisionLogic.contextEntry).to.have.length(3);
  expect(decision.decisionLogic.contextEntry[0].variable.name).to.equal('Base');
  expect(decision.decisionLogic.contextEntry[0].value.$type).to.equal('dmn:LiteralExpression');
  expect(decision.decisionLogic.contextEntry[2].variable).not.to.exist;
  expect(decision.decisionLogic.contextEntry[2].value.text).to.equal('Bonus');
}

function assertBkmInvocation(definitions) {
  const bkm = findElement(definitions, 'BKM_DiscountRate');
  const decision = findElement(definitions, 'Decision_Discount');

  expect(bkm.$type).to.equal('dmn:BusinessKnowledgeModel');
  expect(bkm.encapsulatedLogic.$type).to.equal('dmn:FunctionDefinition');
  expect(bkm.encapsulatedLogic.kind).to.equal('FEEL');
  expect(bkm.encapsulatedLogic.formalParameter).to.have.length(1);
  expect(bkm.encapsulatedLogic.formalParameter[0].name).to.equal('total');
  expect(bkm.encapsulatedLogic.body.$type).to.equal('dmn:LiteralExpression');

  expect(decision.decisionLogic.$type).to.equal('dmn:Invocation');
  expect(decision.decisionLogic.calledFunction.$type).to.equal('dmn:LiteralExpression');
  expect(decision.decisionLogic.binding).to.have.length(1);
  expect(decision.decisionLogic.binding[0].parameter.name).to.equal('total');
  expect(decision.decisionLogic.binding[0].bindingFormula.$type).to.equal('dmn:LiteralExpression');
}

function assertBoxedCollections(definitions) {
  expect(findElement(definitions, 'Decision_List').decisionLogic.$type).to.equal('dmn:List');
  expect(findElement(definitions, 'Decision_Relation').decisionLogic.$type).to.equal('dmn:Relation');
  expect(findElement(definitions, 'Decision_Conditional').decisionLogic.$type).to.equal('dmn:Conditional');

  const forExpression = findElement(definitions, 'Decision_For').decisionLogic;

  expect(forExpression.$type).to.equal('dmn:For');
  expect(forExpression.iteratorVariable).to.equal('x');
  expect(forExpression.in.value.$type).to.equal('dmn:LiteralExpression');
  expect(forExpression.return.value.$type).to.equal('dmn:LiteralExpression');

  const everyExpression = findElement(definitions, 'Decision_Every').decisionLogic;
  const someExpression = findElement(definitions, 'Decision_Some').decisionLogic;

  expect(everyExpression.$type).to.equal('dmn:Quantified');
  expect(everyExpression.iteratorVariable).to.equal('x');
  expect(everyExpression.satisfies.value.$type).to.equal('dmn:LiteralExpression');
  expect(someExpression.$type).to.equal('dmn:Quantified');
  expect(someExpression.iteratorVariable).to.equal('x');
  expect(someExpression.satisfies.value.$type).to.equal('dmn:LiteralExpression');

  const filter = findElement(definitions, 'Decision_Filter').decisionLogic;

  expect(filter.$type).to.equal('dmn:Filter');
  expect(filter.in.value.$type).to.equal('dmn:LiteralExpression');
  expect(filter.match.value.$type).to.equal('dmn:LiteralExpression');
}

function assertDecisionServices(definitions) {
  const approval = findElement(definitions, 'Service_Approval');
  const routingOnly = findElement(definitions, 'Service_RoutingOnly');

  expect(approval.$type).to.equal('dmn:DecisionService');
  expect(approval.outputDecision).to.have.length(1);
  expect(approval.outputDecision[0].href).to.equal('#Decision_Routing');
  expect(approval.encapsulatedDecision).to.have.length(1);
  expect(approval.encapsulatedDecision[0].href).to.equal('#Decision_Eligibility');
  expect(approval.inputData).to.have.length(1);
  expect(approval.inputData[0].href).to.equal('#Input_Age');

  expect(routingOnly.$type).to.equal('dmn:DecisionService');
  expect(routingOnly.inputDecision).to.have.length(1);
  expect(routingOnly.inputDecision[0].href).to.equal('#Decision_Eligibility');
}

const fixtures = [
  {
    name: 'boxed context',
    path: 'test/fixtures/dmn15/context.dmn',
    assertModel: assertContext
  },
  {
    name: 'BKM invocation',
    path: 'test/fixtures/dmn15/bkm-invocation.dmn',
    assertModel: assertBkmInvocation
  },
  {
    name: 'boxed collections',
    path: 'test/fixtures/dmn15/boxed-collections.dmn',
    assertModel: assertBoxedCollections
  },
  {
    name: 'decision services',
    path: 'test/fixtures/dmn15/decision-service.dmn',
    assertModel: assertDecisionServices
  }
];

describe('dmn-moddle - DMN 1.5 compatibility', function() {

  this.timeout(30000);

  for (const fixture of fixtures) {
    it(`roundtrips ${fixture.name} without semantic loss`, async function() {
      const moddle = createModdle(undefined, { dmnVersion: '1.5' });

      const {
        rootElement: definitions,
        warnings
      } = await moddle.fromXML(readFile(fixture.path), 'dmn:Definitions');

      expect(warnings, JSON.stringify(warnings, null, 2)).to.be.empty;
      fixture.assertModel(definitions);

      const { xml } = await moddle.toXML(definitions, { format: true });

      await validateXML(xml, xsd);

      const {
        rootElement: reimported,
        warnings: reimportWarnings
      } = await moddle.fromXML(xml, 'dmn:Definitions');

      expect(reimportWarnings, JSON.stringify(reimportWarnings, null, 2)).to.be.empty;
      fixture.assertModel(reimported);
    });
  }
});
