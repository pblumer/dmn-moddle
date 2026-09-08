# OMG DMN 1.5 schema provenance

The DMN 1.5 schema sources vendored in this fork come from the official OMG DMN Task Force specification repository.

- Repository: `omg-dmn-taskforce/omg-dmn-spec`
- Tag: `v1.5`
- Pinned commit: `005a42a22a7f3332768bb62ef47f091023e05e35`
- DMN model namespace: `https://www.omg.org/spec/DMN/20230324/MODEL/`
- DMNDI namespace: `https://www.omg.org/spec/DMN/20230324/DMNDI/`

Vendored source files:

| Local file | OMG path | OMG Git blob SHA |
| --- | --- | --- |
| `resources/dmn/xmi/DMN15.xmi` | `xmi/DMN15.xmi` | `81ee698608ffbfcf9e5f3b4d07783be067a27ec6` |
| `resources/dmn/xmi/DMNDI15.xmi` | `xmi/DMNDI15.xmi` | `5cef906231b99c08a513c3897ae8ea527d226605` |
| `resources/dmn/xsd/DMN15.xsd` | `xsd/DMN15.xsd` | `a6b161ecbb66fb241adc2a86791414da9133e5ba` |
| `resources/dmn/xsd/DMNDI15.xsd` | `xsd/DMNDI15.xsd` | `17b553534f6fa93a8d1c89c48deeb4fda063536f` |

These files are normative source inputs. Generated moddle JSON descriptors must be reproducible from these pinned sources and must not be edited by hand.

The fork should only update this pin deliberately, after reviewing the upstream OMG change and re-running the complete descriptor, round-trip, XSD validation, and integration test suites.
