const fs = require('node:fs');

const parseFile = require('cmof-parser');

const {
  transformDC,
  transformDI,
  transformDMN,
  transformDMNDI
} = require('./transforms/index.cjs');

function normalizeUmlModelRoot(xmi) {
  return xmi
    .replace('<uml:Model ', '<uml:Package ')
    .replace('</uml:Model>', '</uml:Package>');
}

function selectPackage(parsed, packageName) {
  if (!packageName) {
    return parsed;
  }

  const packages = parsed.elementsByType[ 'uml:Package' ] || [];
  const selected = packages.find(pkg => pkg.name === packageName);

  if (!selected) {
    throw new Error(`package <${ packageName }> not found in XMI`);
  }

  parsed.elementsByType[ 'uml:Package' ] = [
    selected,
    ...packages.filter(pkg => pkg !== selected)
  ];

  return parsed;
}

async function generateSchema(files) {
  for (const file of files) {
    const {
      normalize,
      options,
      packageName,
      source,
      target,
      transform,
      transformOptions
    } = file;

    let sourceContents = fs.readFileSync(source, 'utf8');

    if (normalize) {
      sourceContents = normalize(sourceContents);
    }

    let parsed = await parseFile(sourceContents, options);

    parsed = selectPackage(parsed, packageName);

    const transformed = await transform(parsed, transformOptions);

    fs.writeFileSync(target, JSON.stringify(transformed, null, 2));
  }
}

generateSchema([
  {
    source: 'resources/dmn/xmi/DMN13.xmi',
    target: 'resources/dmn/json/dmn13.json',
    transform: transformDMN,
    packageName: 'DMN',
    options: {
      clean: true,
      prefixNamespaces: {
        'DC': 'dc',
        'DI': 'di',
        'http://www.omg.org/spec/BMM/20130801/BMM.xmi': 'bmm',
        'http://www.omg.org/spec/BPMN/20100501/BPMN20.cmof': 'bpmn',
        'https://www.omg.org/spec/DMN/20191111/DMNDI13.xmi': 'dmndi'
      }
    }
  },
  {
    source: 'resources/dmn/xmi/DMNDI13.xmi',
    target: 'resources/dmn/json/dmndi13.json',
    transform: transformDMNDI,
    packageName: 'DMNDI',
    options: {
      clean: true,
      prefixNamespaces: {
        'DC': 'dc',
        'DI': 'di'
      }
    }
  },
  {
    source: 'resources/dmn/xmi/DMN15.xmi',
    target: 'resources/dmn/json/dmn15.json',
    transform: transformDMN,
    packageName: 'DMN',
    transformOptions: {
      xsdFile: 'resources/dmn/xsd/DMN15.xsd'
    },
    normalize: normalizeUmlModelRoot,
    options: {
      clean: true,
      prefixNamespaces: {
        'DC': 'dc',
        'DI': 'di',
        'http://www.omg.org/spec/BMM/20130801/BMM.xmi': 'bmm',
        'http://www.omg.org/spec/BPMN/20100501/BPMN20.cmof': 'bpmn',
        'https://www.omg.org/spec/DMN/20230324/DMNDI15.xmi': 'dmndi'
      }
    }
  },
  {
    source: 'resources/dmn/xmi/DMNDI15.xmi',
    target: 'resources/dmn/json/dmndi15.json',
    transform: transformDMNDI,
    packageName: 'DMNDI',
    transformOptions: {
      xsdFile: 'resources/dmn/xsd/DMNDI15.xsd'
    },
    normalize: normalizeUmlModelRoot,
    options: {
      clean: true,
      prefixNamespaces: {
        'DC': 'dc',
        'DI': 'di'
      }
    }
  },
  {
    source: 'resources/dmn/xmi/DMNDI13.xmi',
    target: 'resources/dmn/json/dc.json',
    transform: transformDC,
    options: {
      clean: true,
      prefixNamespaces: {
        'DC': 'dc',
        'DI': 'di'
      }
    }
  },
  {
    source: 'resources/dmn/xmi/DMNDI13.xmi',
    target: 'resources/dmn/json/di.json',
    transform: transformDI,
    options: {
      clean: true,
      prefixNamespaces: {
        'DC': 'dc',
        'DI': 'di'
      }
    }
  }
]).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
