import Decimal from "decimal.js";
import formatNumber, { FormatOptions } from "./numberish/formatNumber";

export function pad(d: number): string {
  return d < 10 ? "0" + d.toString() : d.toString();
}

const specialSymbolsRegex = /[.*+?^${}()|[\]\\]/g;
const currencyRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

export function transformToNumber(value: string): string {
  const transformComma = value.replace(/,/g, ".");
  const escapeRegExp = transformComma.replace(specialSymbolsRegex, "\\$&");
  if (transformComma === "" || currencyRegex.test(escapeRegExp)) {
    return transformComma;
  }
  return "";
}

export const fixedNumberInput = (value: string, fractionDigits: number) => {
  let _value = value;
  const [left, right] = _value.split(".");
  if (right?.length > fractionDigits) {
    _value = left + "." + right?.slice(0, fractionDigits);
  }
  return _value;
};

export const formatSmartNumber = (
  num: number | string,
  toFixed: number = 2
): string => {
  if (!num) return "0";
  if (typeof num === "string") {
    num = Number(num);
  }

  if (num >= 10) {
    return parseFloat(num.toFixed(1)).toString();
  } else if (num >= 1) {
    return parseFloat(num.toFixed(toFixed)).toString();
  } else {
    let numberDecimalAfterZero = 3;

    if (Number(num) >= 0.1) {
      numberDecimalAfterZero = 4;
    }

    const strNumber = num.toFixed(13).toString();
    const arr = strNumber.split(".");
    if (arr.length === 1) {
      return num.toString();
    }
    const decimal = arr[1];
    //find first non-zero number
    let index = 0;
    while (index < decimal.length && decimal[index] === "0") {
      index++;
    }
    if (index === decimal.length) {
      return parseFloat(num.toString()).toString();
    }

    let threeDecimal = decimal.slice(index, index + numberDecimalAfterZero);

    threeDecimal = Number(threeDecimal.split("").reverse().join(""))
      .toString()
      .split("")
      .reverse()
      .join("");

    return `${arr[0]}.${decimal.slice(0, index)}${threeDecimal}`;
  }
};

export function formatNumberV2(
  value: number | string,
  options: Intl.NumberFormatOptions = {},
  fractionDigits: number = 2
): string {
  if (typeof value === "string") value = Number(value);
  if (typeof value !== "number" || isNaN(value)) return "";
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    compactDisplay: "short",
    ...options,
  }).format(value);
}

export function smNumber(
  value: number,
  threshold = 5,
  minimumSignificantDigits = 2
): string {
  if (value === 0) return "0";
  if (!value) return "-";
  const subs = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  const [left, right] = value?.toFixed(String(value).length).split(".");
  const result = right.match(`^([0]{${threshold},})`);
  if (result) {
    const length = result[0].length;
    const subStr = length.toString().replace(/\d/g, (digit) => subs[+digit]);
    const end = right.slice(length);
    return (left + ".0" + subStr + end)
      .replace(/0+$/, "")
      .substring(0, 4 + minimumSignificantDigits);
  }
  return formatNumberV2(value, {
    minimumSignificantDigits,
    maximumSignificantDigits: 3,
  });
}

export const formatNumberShort = (
  number: number | string | Decimal | null | undefined,
  {
    groupSeparator = ",",
    maxDecimalCount = 2,
    groupSize = 3,
    decimalMode = "trim",
    needSeperate = true,
    useShorterExpression,
  }: FormatOptions = {}
) => {
  if (!number) return "0";

  if (Number(number) < 0.001) return smNumber(Number(number), 3);

  if (Number(number) < 0.1) return formatSmartNumber(number.toString());

  if (number === 0) return 0;

  return formatNumber(number, {
    groupSeparator,
    maxDecimalCount,
    groupSize,
    decimalMode,
    needSeperate,
    useShorterExpression,
  });
};

export const add = (a: number | string, b: number | string) => {
  return new Decimal(a).plus(b).toNumber();
};

export const mul = (a: number | string, b: number | string) => {
  return new Decimal(a).mul(b).toNumber();
};

export const minus = (a: number | string, b: number | string) => {
  return new Decimal(a).minus(b).toNumber();
};

export const div = (a: number | string, b: number | string) => {
  return new Decimal(a).div(b).toNumber();
};

export const ceil = (a: number | string) => {
  return new Decimal(a).ceil().toNumber();
};

export const floor = (a: number | string) => {
  return new Decimal(a).floor().toNumber();
};

export const toNumber = (a: number | string, precision = 9) => {
  const DecimalPrecision = Decimal.clone({ precision: precision });

  return new DecimalPrecision(a)
    .toNearest(1 / 10 ** precision, Decimal.ROUND_DOWN)
    .toNumber();
};
