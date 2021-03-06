import {each, createHashMap, assert} from 'zrender/src/core/util';
import { __DEV__ } from '../../config';

export var OTHER_DIMENSIONS = createHashMap([
    'tooltip', 'label', 'itemName', 'seriesName'
]);

export function summarizeDimensions(data) {
    var summary = {};
    var encode = summary.encode = {};
    var defaultedLabel = [];

    each(data.dimensions, function (dimName) {
        var dimItem = data.getDimensionInfo(dimName);

        var coordDim = dimItem.coordDim;
        if (coordDim) {
            if (__DEV__) {
                assert(OTHER_DIMENSIONS.get(coordDim) == null);
            }
            var coordDimArr = encode[coordDim];
            if (!encode.hasOwnProperty(coordDim)) {
                coordDimArr = encode[coordDim] = [];
            }
            coordDimArr[dimItem.coordDimIndex] = dimName;

            if (dimItem.isSysCoord && mayLabelDimType(dimItem.type)) {
                defaultedLabel.push(dimName);
            }
        }

        OTHER_DIMENSIONS.each(function (v, otherDim) {
            var otherDimArr = encode[otherDim];
            if (!encode.hasOwnProperty(otherDim)) {
                otherDimArr = encode[otherDim] = [];
            }

            var dimIndex = dimItem.otherDims[otherDim];
            if (dimIndex != null && dimIndex !== false) {
                otherDimArr[dimIndex] = dimItem.name;
            }
        });
    });

    var encodeLabel = encode.label;
    if (encodeLabel && encodeLabel.length) {
        defaultedLabel = encodeLabel.slice();
    }

    var defaultedTooltip = defaultedLabel.slice();
    var encodeTooltip = encode.tooltip;
    if (encodeTooltip && encodeTooltip.length) {
        defaultedTooltip = encodeTooltip.slice();
    }

    encode.defaultedLabel = defaultedLabel;
    encode.defaultedTooltip = defaultedTooltip;

    return summary;
}

export function getDimensionTypeByAxis(axisType) {
    return axisType === 'category'
        ? 'ordinal'
        : axisType === 'time'
        ? 'time'
        : 'float';
}

function mayLabelDimType(dimType) {
    // In most cases, ordinal and time do not suitable for label.
    // Ordinal info can be displayed on axis. Time is too long.
    return !(dimType === 'ordinal' || dimType === 'time');
}

// function findTheLastDimMayLabel(data) {
//     // Get last value dim
//     var dimensions = data.dimensions.slice();
//     var valueType;
//     var valueDim;
//     while (dimensions.length && (
//         valueDim = dimensions.pop(),
//         valueType = data.getDimensionInfo(valueDim).type,
//         valueType === 'ordinal' || valueType === 'time'
//     )) {} // jshint ignore:line
//     return valueDim;
// }
