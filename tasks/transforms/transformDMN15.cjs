const transformDMN = require('./transformDMN.cjs');

/**
 * Adapt the official DMN 1.5 XMI model to the small set of historical XMI quirks
 * expected by the shared DMN transform, then run the common transform pipeline.
 *
 * Keep this adapter intentionally small. It exists to bridge differences in the
 * OMG XMI source representation, not to hand-maintain a parallel DMN metamodel.
 */
module.exports = async function(results, options = {}) {
  const packages = results.elementsByType[ 'uml:Package' ] || [];
  const model = packages[ 0 ];

  if (!model) {
    throw new Error('DMN package not found');
  }

  // DMN 1.3 XMI misspelled Context#contextEntry as `contextEnrty`. The shared
  // transform contains the upstream correction for that typo. DMN 1.5 fixes the
  // source spelling, so present the historical spelling only inside this adapter
  // and let the shared transform normalize it back to `contextEntry`.
  const context = (model.types || []).find(type => type.name === 'Context');
  const contextEntry = context && (context.properties || []).find(property => property.name === 'contextEntry');

  if (contextEntry) {
    contextEntry.name = 'contextEnrty';
  }

  const transformed = await transformDMN(results, options);

  // The DMN package and DMNDI package are nested in the DMN 1.5 UML model. The
  // XMI parser resolves Definitions#dmnDI to the local class name and therefore
  // loses the cross-package prefix. Restore the namespace required by DMN XML.
  const definitions = transformed.types.find(type => type.name === 'Definitions');
  const dmnDI = definitions && definitions.properties.find(property => property.name === 'dmnDI');

  if (dmnDI) {
    dmnDI.type = 'dmndi:DMNDI';
  }

  // DMN15.xmi contains an unnamed UML generalization on TypedChildExpression.
  // DMN15.xsd is normative for XML and defines exactly one base type:
  // tTypedChildExpression extends tChildExpression.
  const typedChildExpression = transformed.types.find(type => type.name === 'TypedChildExpression');

  if (typedChildExpression) {
    typedChildExpression.superClass = [ 'ChildExpression' ];
  }

  // DMN15.xsd defines iteratorVariable as an attribute of tIterator. It is not
  // represented as a usable named property by the exported UML XMI, so add the
  // descriptor property from the normative XSD here.
  const iterator = transformed.types.find(type => type.name === 'Iterator');

  if (iterator && !iterator.properties.find(property => property.name === 'iteratorVariable')) {
    iterator.properties.push({
      name: 'iteratorVariable',
      type: 'String',
      isAttr: true
    });
  }

  // DMN 1.5 defines the XML elements <every> and <some> with the shared XSD
  // type tQuantified. moddle resolves polymorphic expression elements by their
  // XML tag name, therefore expose two descriptor-only element identities that
  // inherit the common Quantified semantics. With the package's lowerCase tag
  // alias they round-trip as <every> and <some> while remaining Quantified.
  for (const name of [ 'Every', 'Some' ]) {
    if (!transformed.types.find(type => type.name === name)) {
      transformed.types.push({
        name,
        superClass: [ 'Quantified' ]
      });
    }
  }

  return transformed;
};
