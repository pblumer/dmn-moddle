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

  return transformDMN(results, options);
};
