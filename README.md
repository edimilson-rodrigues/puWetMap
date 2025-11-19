# puWetMap
This repository contains all the Google Earth Engine codes used to classify and analyse peri-urban wetlands within Mogi-Guaçu, Pardo, and Tietê-Jacaré River Water Resources Management Unities.

## Citation
If you use this codes or data in your research, please cite it using the following DOI:
[![DOI](https://zenodo.org/badge/912974541.svg)](https://doi.org/10.5281/zenodo.17644783)

**Example Citation:**
> Santos JR, E. R. (2024). *puWetMap* (v1.0.0). Zenodo. https://doi.org/10.5281/zenodo.17644784 

# Google Earth Engine repository
All codes used are available in https://earthengine.googlesource.com/users/ee-ers/puWetMap 

# Image processing
The codes within [imgProcesing](imgProcesing) presents the procedures to obtain Landsat mosaics for the study area. The main code is [mosaicExportByRegion.js](imgProcessing/mosaicExportByRegion.js)

# Classification
The codes within [classification](classification) presents the essentials to random forest classification and ROC curve and AUC analysis, as well the accuracy assessment. The main code is [classification.js](classification/classification.js)

# Spatial results
Access to spatial layers are available using the code [spatial tool](tool/spatialResults.js) and can be easily viewed [here](https://ee-ers.projects.earthengine.app/view/peri-urban-wetlands-analysis).

Further information and requests for resources should be directed to and will be fulfilled by Edimilson Rodrigues (edimilson.rodrigues.santos@usp.br).
