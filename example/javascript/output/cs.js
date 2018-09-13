;(function() {
  function getTimezoneOffset(timezoneOffset, options) {
    options = options || {};
    options.hours = typeof options.hours !== 'undefined' ? options.hours : true;
    options.zeroPaddingHours = typeof options.zeroPaddingHours !== 'undefined' ? options.zeroPaddingHours : true;
    options.minutes = typeof options.minutes !== 'undefined' ? options.minutes : true;
    options.colon = typeof options.colon !== 'undefined' ? options.colon : true;
    options.zulu = typeof options.zulu !== 'undefined' ? options.zulu : false;

    var offsetFloatingHours = timezoneOffset / 60;
    var offsetHours;
    var offsetMinutes;

    if(timezoneOffset >= 0) {
      offsetHours = Math.floor(offsetFloatingHours);
      offsetMinutes = ((offsetFloatingHours % 1) * 60).toFixed(0);
    }
    else {
      offsetHours = Math.ceil(offsetFloatingHours);
      offsetMinutes = - ((offsetFloatingHours % 1) * 60).toFixed(0);
    }
    if(offsetMinutes < 10) {
      offsetMinutes = '0' + offsetMinutes;
    }

    if(options.zulu && offsetHours === 0) {
      return 'Z';
    }

    var result = '';
    if(options.zeroPaddingHours) {
      if(offsetHours > -10 && offsetHours < 0) {
        offsetHours = (offsetHours + '').replace('-', '-0');
      }
      else if(offsetHours >= 0 && offsetHours < 10) {
        offsetHours = '0' + offsetHours;
      }
    }
    if(options.hours) {
      if((offsetHours + '').charAt(0) !== '-') {
        offsetHours = '+' + offsetHours;
      }
      result += offsetHours;
    }
    if(options.colon) {
      result += ':';
    }
    if(options.minutes) {
      result += offsetMinutes;
    }

    return result;
  }

  function getLongLocalizedGMT(GMTFormat, timezoneOffset) {
    return GMTFormat.replace('{0}', getTimezoneOffset(timezoneOffset));
  }

  function roundTo(number, to) {
    return Math.round(number / to) * to;
  }

  function toSignficantDigits(number, minimumSignificantDigits, maximumSignificantDigits) {
    var multiple = Math.pow(10, maximumSignificantDigits - Math.floor(Math.log(number) / Math.LN10) - 1);
    number = Math.round(number * multiple) / multiple + '';
    var difference = maximumSignificantDigits - minimumSignificantDigits;
    if(difference > 0 && /\./.test(difference)) {
      number = number.replace(new RegExp('0{1,' + difference + '}$'), '');
    }
    var subtract = 0;
    if(/^0\./.test(number)) {
      subtract = 2;
    }
    else if(/\./.test(number)) {
      subtract = 1;
    }
    while(number.length - subtract < minimumSignificantDigits) {
      number += '0';
    }

    return number;
  }

  function toExponentDigits(number, it) {
    var minimumMantissaIntegerDigits = 1
      , maximumMantissaIntegerDigits = Infinity
      , exponentGrouping = 1
      , minimumMantissaSignificantDigits
      , maximumMantissaSignificantDigits
      , exponentNumber = 0;

    if(it.type === 'floating') {
      if(it.maximumIntegerDigits === it.minimumIntegerDigits) {
        minimumMantissaIntegerDigits = maximumMantissaIntegerDigits = it.minimumIntegerDigits;
      }
      else {
        maximumMantissaIntegerDigits = it.maximumIntegerDigits;
        exponentGrouping = it.maximumIntegerDigits;
      }

      minimumMantissaSignificantDigits = 1;
      maximumMantissaSignificantDigits = it.minimumIntegerDigits + it.maximumFractionDigits;
    }
    else {
      minimumMantissaIntegerDigits = maximumMantissaIntegerDigits = 1;
      minimumMantissaSignificantDigits = it.minimumSignificantDigits;
      maximumMantissaSignificantDigits = it.maximumSignificantDigits
    }

    if(number >= 1) {
      var divider = Math.pow(10, exponentGrouping)
        , integerLength = (number + '').replace(/\.\d+/, '').length;
      while((integerLength < minimumMantissaIntegerDigits || integerLength > maximumMantissaIntegerDigits) &&
            (exponentNumber + '').length === it.exponent.digits) {
        number = number / divider;
        exponentNumber += exponentGrouping;
        integerLength = (number + '').replace(/\.\d+/, '').length;
      }
      if((exponentNumber + '').length !== it.exponent.digits) {
        exponentNumber--;
        number = number * divider;
      }
    }
    else {
      var multiplier = Math.pow(10, exponentGrouping)
        , integerLength = (number + '').replace(/^0\.\d+/, '').replace(/\.\d+/, '').length;
      while((integerLength < minimumMantissaIntegerDigits || integerLength > maximumMantissaIntegerDigits) &&
            (Math.abs(exponentNumber) + '').length === it.exponent.digits) {
        number = number * multiplier;
        exponentNumber -= exponentGrouping;
        integerLength = (number + '').replace(/^0\.\d+/, '').replace(/\.\d+/, '').length;
      }
      if((Math.abs(exponentNumber) + '').length !== it.exponent.digits) {
        exponentNumber++;
        number = number / multiplier;
      }
    }

    var mantissa = toSignficantDigits(number, minimumMantissaSignificantDigits, maximumMantissaSignificantDigits)
      , mantissa = mantissa.split('.')
      , exponent = it.symbols.exponential;
    if(it.exponent.plusSign && exponentNumber > 0) {
      exponent += it.symbols.plusSign;
    }
    exponent += exponentNumber;

    if(it.type === 'floating') {
      if(it.minimumFractionDigits > 0) {
        if(typeof mantissa[1] === 'undefined') {
          mantissa[1] = '';
        }
        while(mantissa[1].length < it.minimumFractionDigits) {
          mantissa[1] += '0';
        }
      }
    }

    return {
      integer: mantissa[0],
      fraction: mantissa[1],
      exponent: exponent
    };
  };

  function formatNumber(it) {
    if(typeof it.number !== 'number') {
      return it.symbols.nan;
    }
    if(it.number === Infinity) {
      return it.symbols.plusSign + it.symbols.infinity;
    }
    if(it.number === -Infinity) {
      return it.symbols.minusSign + it.symbols.infinity;
    }

    var number = Math.abs(it.number)
      , prefix = it.prefix
      , suffix = it.suffix
      , currencySymbol =
        '([\\u0024\\u00A2-\\u00A5\\u058F\\u060B\\u09F2\\u09F3\\u09FB\\u0AF1\\\
           \\u0BF9\\u0E3F\\u17DB\\u20A0-\\u20BD\\uA838\\uFDFC\\uFE69\\uFF04\\\
           \\uFFE0\\uFFE1\\uFFE5\\uFFE6])'
      , startsWithCurrencySymbolSyntax = new RegExp('^' + currencySymbol)
      , endsWithCurrencySymbolSyntax = new RegExp(currencySymbol + '$');

    if(it.percentage) {
      prefix = prefix.replace('%', it.symbols.percentSign);
      suffix = suffix.replace('%', it.symbols.percentSign);
      number = number * 100;
    }
    else if(it.permille) {
      prefix = prefix.replace('‰', it.symbols.perMille);
      suffix = suffix.replace('‰', it.symbols.perMille);
      number = number * 1000;
    }

    if(it.exponent) {
      var exponent = toExponentDigits(number, it);
      integerDigits = exponent.integer;
      fractionDigits = exponent.fraction || '';
      exponent = exponent.exponent;
    }
    else if(it.type === 'significant') {
      number = toSignficantDigits(number, it.minimumSignificantDigits, it.maximumSignificantDigits);
    }
    else {
      number = roundTo(number, it.roundTo);
    }

    if(!it.exponent) {
      var numberSplit = (number + '').split('.')
        , integerDigits = numberSplit[0]
        , integerDigitsLength = integerDigits.length
        , fractionDigits = numberSplit[1] || ''
        , fractionDigitsLength = fractionDigits.length;

      if(it.type === 'floating' && integerDigitsLength < it.minimumIntegerDigits) {
        var missingIntegerDigits = it.minimumIntegerDigits - integerDigitsLength;
        for(var index = 0; index < missingIntegerDigits; index++) {
          integerDigits = '0' + integerDigits;
        }
        integerDigitsLength = it.minimumIntegerDigits;
      }
      if(it.groupSize) {
        var newIntegerDigits = '';
        for(var index = integerDigitsLength - 1; index >= 0; index--) {
          var primaryIndex = integerDigitsLength - it.groupSize.primary - 1;
          if(index === primaryIndex) {
            newIntegerDigits += it.symbols.group;
          }
          else if(index < primaryIndex && (primaryIndex - index) % it.groupSize.secondary === 0) {
            newIntegerDigits += it.symbols.group;
          }

          newIntegerDigits += integerDigits.charAt(index);
        }
        integerDigits = newIntegerDigits.split('').reverse().join('');
      }

      if(it.type === 'floating') {
        if(fractionDigitsLength > it.maximumFractionDigits) {
          fractionDigits = fractionDigits.substring(0, it.maximumFractionDigits);
        }
        else if(fractionDigitsLength < it.minimumFractionDigits) {
          var missingFractionDigits = it.minimumFractionDigits - fractionDigitsLength;
          for(var index = 0; index < missingFractionDigits; index++) {
            fractionDigits += '0';
          }
        }

        if(fractionDigits.length > it.minimumFractionDigits) {
          fractionDigits = fractionDigits.replace(/[0]+$/, '');
        }
      }
    }

    if(it.currency) {
      if(!endsWithCurrencySymbolSyntax.test(it.currency.symbol)) {
        prefix = prefix + ' ';
      }
      if(!startsWithCurrencySymbolSyntax.test(it.currency.symbol)) {
        suffix = ' ' + suffix;
      }
      prefix = prefix.replace(/¤+/, it.currency.symbol);
      suffix = suffix.replace(/¤+/, it.currency.symbol);
    }

    var result = '';
    result += prefix;
    result += integerDigits;
    if(fractionDigits.length > 0) {
      result += it.symbols.decimal + fractionDigits;
    }
    if(exponent) {
      result += exponent;
    }
    result += suffix;

    if(it.paddingCharacter) {
      var resultLength = result.length - 2;
      result = result.replace(new RegExp('\\*\\' + it.paddingCharacter), function(match) {
        var replacement = '';
        while(resultLength < it.patternLength) {
          replacement += it.paddingCharacter;
          resultLength++;
        }

        return replacement;
      });
    }

    return result;
  }

  var localizations = {
    'cs': {
      '__getPluralKeyword': function(cardinal) {
        var cardinal = cardinal + ''
          , n = cardinal
          , i = parseInt(cardinal, 10)
          , v = 0
          , w = 0
          , f = 0
          , t = 0;

        var hasFractionalDigitsSyntax = /\.(\d+)/;

        if(hasFractionalDigitsSyntax.test(cardinal)) {
          f = hasFractionalDigitsSyntax.exec(cardinal)[1];
          v = f.length;
          t = cardinal.replace(/0+$/, '');
          t = hasFractionalDigitsSyntax.exec(t)[1];
          w = t.length;
        }
        if(i === 1 && v === 0) {
          return 'one';
        }
        else if((i >= 2 && i <= 4) && v === 0) {
          return 'few';
        }
        else if(v !== 0) {
          return 'many';
        }
        return 'other';
      },
      '__getOrdinalKeyword': function(cardinal) {
        return 'other';
      },
      '__numberSymbols': {
        'latn': {
          'decimal': ',',
          'group': ' ',
          'list': ';',
          'percentSign': '%',
          'plusSign': '+',
          'minusSign': '-',
          'exponential': 'E',
          'superscriptingExponent': '×',
          'perMille': '‰',
          'infinity': '∞',
          'nan': 'NaN',
          'timeSeparator': ':'
        }
      },
      '__currencies': {
        'USD': {
          'name': 'americký dolar',
          'text': {
            'local': null,
            'global': {
              'one': 'americký dolar',
              'few': 'americké dolary',
              'many': 'amerického dolaru',
              'other': 'amerických dolarů'
            }
          },
          'symbol': {
            'local': '$',
            'global': 'US$',
            'reverseGlobal': '$US'
          }
        }
      },
      '__currencyUnitPattern': {
        'one': '{0} {1}',
        'few': '{0} {1}',
        'many': '{0} {1}',
        'other': '{0} {1}'
      },
      '__formatStandardNumber__latn': function(value) {
        return formatNumber({
          number: value,
          type: 'floating',
          roundTo: 0.001,
          prefix: '',
          suffix: '',
          percentage: null,
          permille: null,
          currency: null,
          groupSize: {
            primary: 3,
            secondary: 3
          },
          exponent: null,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 4,
          minimumFractionDigits: 0,
          maximumFractionDigits: 3,
          minimumSignificantDigits: 0,
          maximumSignificantDigits: 0,
          symbols: this.__numberSymbols['latn'],
          paddingCharacter: null,
          patternLength: 9
        });
      },
      '__shortFormats__latn': [{"threshold":1000,"formats":[{"pluralForm":"one","format":"{0} tis'.'","decimalPattern":"0"},{"pluralForm":"few","format":"{0} tis'.'","decimalPattern":"0"},{"pluralForm":"many","format":"{0} tis'.'","decimalPattern":"0"},{"pluralForm":"other","format":"{0} tis'.'","decimalPattern":"0"}]},{"threshold":10000,"formats":[{"pluralForm":"one","format":"{0} tis'.'","decimalPattern":"00"},{"pluralForm":"few","format":"{0} tis'.'","decimalPattern":"00"},{"pluralForm":"many","format":"{0} tis'.'","decimalPattern":"00"},{"pluralForm":"other","format":"{0} tis'.'","decimalPattern":"00"}]},{"threshold":100000,"formats":[{"pluralForm":"one","format":"{0} tis'.'","decimalPattern":"000"},{"pluralForm":"few","format":"{0} tis'.'","decimalPattern":"000"},{"pluralForm":"many","format":"{0} tis'.'","decimalPattern":"000"},{"pluralForm":"other","format":"{0} tis'.'","decimalPattern":"000"}]},{"threshold":1000000,"formats":[{"pluralForm":"one","format":"{0} mil'.'","decimalPattern":"0"},{"pluralForm":"few","format":"{0} mil'.'","decimalPattern":"0"},{"pluralForm":"many","format":"{0} mil'.'","decimalPattern":"0"},{"pluralForm":"other","format":"{0} mil'.'","decimalPattern":"0"}]},{"threshold":10000000,"formats":[{"pluralForm":"one","format":"{0} mil'.'","decimalPattern":"00"},{"pluralForm":"few","format":"{0} mil'.'","decimalPattern":"00"},{"pluralForm":"many","format":"{0} mil'.'","decimalPattern":"00"},{"pluralForm":"other","format":"{0} mil'.'","decimalPattern":"00"}]},{"threshold":100000000,"formats":[{"pluralForm":"one","format":"{0} mil'.'","decimalPattern":"000"},{"pluralForm":"few","format":"{0} mil'.'","decimalPattern":"000"},{"pluralForm":"many","format":"{0} mil'.'","decimalPattern":"000"},{"pluralForm":"other","format":"{0} mil'.'","decimalPattern":"000"}]},{"threshold":1000000000,"formats":[{"pluralForm":"one","format":"{0} mld'.'","decimalPattern":"0"},{"pluralForm":"few","format":"{0} mld'.'","decimalPattern":"0"},{"pluralForm":"many","format":"{0} mld'.'","decimalPattern":"0"},{"pluralForm":"other","format":"{0} mld'.'","decimalPattern":"0"}]},{"threshold":10000000000,"formats":[{"pluralForm":"one","format":"{0} mld'.'","decimalPattern":"00"},{"pluralForm":"few","format":"{0} mld'.'","decimalPattern":"00"},{"pluralForm":"many","format":"{0} mld'.'","decimalPattern":"00"},{"pluralForm":"other","format":"{0} mld'.'","decimalPattern":"00"}]},{"threshold":100000000000,"formats":[{"pluralForm":"one","format":"{0} mld'.'","decimalPattern":"000"},{"pluralForm":"few","format":"{0} mld'.'","decimalPattern":"000"},{"pluralForm":"many","format":"{0} mld'.'","decimalPattern":"000"},{"pluralForm":"other","format":"{0} mld'.'","decimalPattern":"000"}]},{"threshold":1000000000000,"formats":[{"pluralForm":"one","format":"{0} bil'.'","decimalPattern":"0"},{"pluralForm":"few","format":"{0} bil'.'","decimalPattern":"0"},{"pluralForm":"many","format":"{0} bil'.'","decimalPattern":"0"},{"pluralForm":"other","format":"{0} bil'.'","decimalPattern":"0"}]},{"threshold":10000000000000,"formats":[{"pluralForm":"one","format":"{0} bil'.'","decimalPattern":"00"},{"pluralForm":"few","format":"{0} bil'.'","decimalPattern":"00"},{"pluralForm":"many","format":"{0} bil'.'","decimalPattern":"00"},{"pluralForm":"other","format":"{0} bil'.'","decimalPattern":"00"}]},{"threshold":100000000000000,"formats":[{"pluralForm":"one","format":"{0} bil'.'","decimalPattern":"000"},{"pluralForm":"few","format":"{0} bil'.'","decimalPattern":"000"},{"pluralForm":"many","format":"{0} bil'.'","decimalPattern":"000"},{"pluralForm":"other","format":"{0} bil'.'","decimalPattern":"000"}]}],
      '__short__latn__0': function(value, minimumDigits) {
        minimumDigits = minimumDigits || 1;
        var fractionDigits = minimumDigits - 1;
        if(fractionDigits < 0) {
          fractionDigits = 0;
        }
        return formatNumber({
          number: value,
          type: 'floating',
          roundTo: 1 / Math.pow(10, fractionDigits),
          prefix: '',
          suffix: '',
          percentage: null,
          permille: null,
          currency: null,
          groupSize: null,
          exponent: null,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          minimumSignificantDigits: 0,
          maximumSignificantDigits: 0,
          symbols: this.__numberSymbols['latn'],
          paddingCharacter: null,
          patternLength: 1
        });
      },
      '__short__latn__00': function(value, minimumDigits) {
        minimumDigits = minimumDigits || 1;
        var fractionDigits = minimumDigits - 2;
        if(fractionDigits < 0) {
          fractionDigits = 0;
        }
        return formatNumber({
          number: value,
          type: 'floating',
          roundTo: 1 / Math.pow(10, fractionDigits),
          prefix: '',
          suffix: '',
          percentage: null,
          permille: null,
          currency: null,
          groupSize: null,
          exponent: null,
          minimumIntegerDigits: 2,
          maximumIntegerDigits: 2,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          minimumSignificantDigits: 0,
          maximumSignificantDigits: 0,
          symbols: this.__numberSymbols['latn'],
          paddingCharacter: null,
          patternLength: 2
        });
      },
      '__short__latn__000': function(value, minimumDigits) {
        minimumDigits = minimumDigits || 1;
        var fractionDigits = minimumDigits - 3;
        if(fractionDigits < 0) {
          fractionDigits = 0;
        }
        return formatNumber({
          number: value,
          type: 'floating',
          roundTo: 1 / Math.pow(10, fractionDigits),
          prefix: '',
          suffix: '',
          percentage: null,
          permille: null,
          currency: null,
          groupSize: null,
          exponent: null,
          minimumIntegerDigits: 3,
          maximumIntegerDigits: 3,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          minimumSignificantDigits: 0,
          maximumSignificantDigits: 0,
          symbols: this.__numberSymbols['latn'],
          paddingCharacter: null,
          patternLength: 3
        });
      },
      '__longFormats__latn': [{"threshold":1000,"formats":[{"pluralForm":"one","format":"{0} tisíc","decimalPattern":"0"},{"pluralForm":"few","format":"{0} tisíce","decimalPattern":"0"},{"pluralForm":"many","format":"{0} tisíce","decimalPattern":"0"},{"pluralForm":"other","format":"{0} tisíc","decimalPattern":"0"}]},{"threshold":10000,"formats":[{"pluralForm":"one","format":"{0} tisíc","decimalPattern":"00"},{"pluralForm":"few","format":"{0} tisíc","decimalPattern":"00"},{"pluralForm":"many","format":"{0} tisíce","decimalPattern":"00"},{"pluralForm":"other","format":"{0} tisíc","decimalPattern":"00"}]},{"threshold":100000,"formats":[{"pluralForm":"one","format":"{0} tisíc","decimalPattern":"000"},{"pluralForm":"few","format":"{0} tisíc","decimalPattern":"000"},{"pluralForm":"many","format":"{0} tisíce","decimalPattern":"000"},{"pluralForm":"other","format":"{0} tisíc","decimalPattern":"000"}]},{"threshold":1000000,"formats":[{"pluralForm":"one","format":"{0} milion","decimalPattern":"0"},{"pluralForm":"few","format":"{0} miliony","decimalPattern":"0"},{"pluralForm":"many","format":"{0} milionu","decimalPattern":"0"},{"pluralForm":"other","format":"{0} milionů","decimalPattern":"0"}]},{"threshold":10000000,"formats":[{"pluralForm":"one","format":"{0} milionů","decimalPattern":"00"},{"pluralForm":"few","format":"{0} milionů","decimalPattern":"00"},{"pluralForm":"many","format":"{0} milionu","decimalPattern":"00"},{"pluralForm":"other","format":"{0} milionů","decimalPattern":"00"}]},{"threshold":100000000,"formats":[{"pluralForm":"one","format":"{0} milionů","decimalPattern":"000"},{"pluralForm":"few","format":"{0} milionů","decimalPattern":"000"},{"pluralForm":"many","format":"{0} milionu","decimalPattern":"000"},{"pluralForm":"other","format":"{0} milionů","decimalPattern":"000"}]},{"threshold":1000000000,"formats":[{"pluralForm":"one","format":"{0} miliarda","decimalPattern":"0"},{"pluralForm":"few","format":"{0} miliardy","decimalPattern":"0"},{"pluralForm":"many","format":"{0} miliardy","decimalPattern":"0"},{"pluralForm":"other","format":"{0} miliard","decimalPattern":"0"}]},{"threshold":10000000000,"formats":[{"pluralForm":"one","format":"{0} miliard","decimalPattern":"00"},{"pluralForm":"few","format":"{0} miliard","decimalPattern":"00"},{"pluralForm":"many","format":"{0} miliardy","decimalPattern":"00"},{"pluralForm":"other","format":"{0} miliard","decimalPattern":"00"}]},{"threshold":100000000000,"formats":[{"pluralForm":"one","format":"{0} miliard","decimalPattern":"000"},{"pluralForm":"few","format":"{0} miliard","decimalPattern":"000"},{"pluralForm":"many","format":"{0} miliardy","decimalPattern":"000"},{"pluralForm":"other","format":"{0} miliard","decimalPattern":"000"}]},{"threshold":1000000000000,"formats":[{"pluralForm":"one","format":"{0} bilion","decimalPattern":"0"},{"pluralForm":"few","format":"{0} biliony","decimalPattern":"0"},{"pluralForm":"many","format":"{0} bilionu","decimalPattern":"0"},{"pluralForm":"other","format":"{0} bilionů","decimalPattern":"0"}]},{"threshold":10000000000000,"formats":[{"pluralForm":"one","format":"{0} bilionů","decimalPattern":"00"},{"pluralForm":"few","format":"{0} bilionů","decimalPattern":"00"},{"pluralForm":"many","format":"{0} bilionu","decimalPattern":"00"},{"pluralForm":"other","format":"{0} bilionů","decimalPattern":"00"}]},{"threshold":100000000000000,"formats":[{"pluralForm":"one","format":"{0} bilionů","decimalPattern":"000"},{"pluralForm":"few","format":"{0} bilionů","decimalPattern":"000"},{"pluralForm":"many","format":"{0} bilionu","decimalPattern":"000"},{"pluralForm":"other","format":"{0} bilionů","decimalPattern":"000"}]}],
      '__long__latn__0': function(value, minimumDigits) {
        minimumDigits = minimumDigits || 1;
        var fractionDigits = minimumDigits - 1;
        if(fractionDigits < 0) {
          fractionDigits = 0;
        }
        return formatNumber({
          number: value,
          type: 'floating',
          roundTo: 1 / Math.pow(10, fractionDigits),
          prefix: '',
          suffix: '',
          percentage: null,
          permille: null,
          currency: null,
          groupSize: null,
          exponent: null,
          minimumIntegerDigits: 1,
          maximumIntegerDigits: 1,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          minimumSignificantDigits: 0,
          maximumSignificantDigits: 0,
          symbols: this.__numberSymbols['latn'],
          paddingCharacter: null,
          patternLength: 1
        });
      },
      '__long__latn__00': function(value, minimumDigits) {
        minimumDigits = minimumDigits || 1;
        var fractionDigits = minimumDigits - 2;
        if(fractionDigits < 0) {
          fractionDigits = 0;
        }
        return formatNumber({
          number: value,
          type: 'floating',
          roundTo: 1 / Math.pow(10, fractionDigits),
          prefix: '',
          suffix: '',
          percentage: null,
          permille: null,
          currency: null,
          groupSize: null,
          exponent: null,
          minimumIntegerDigits: 2,
          maximumIntegerDigits: 2,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          minimumSignificantDigits: 0,
          maximumSignificantDigits: 0,
          symbols: this.__numberSymbols['latn'],
          paddingCharacter: null,
          patternLength: 2
        });
      },
      '__long__latn__000': function(value, minimumDigits) {
        minimumDigits = minimumDigits || 1;
        var fractionDigits = minimumDigits - 3;
        if(fractionDigits < 0) {
          fractionDigits = 0;
        }
        return formatNumber({
          number: value,
          type: 'floating',
          roundTo: 1 / Math.pow(10, fractionDigits),
          prefix: '',
          suffix: '',
          percentage: null,
          permille: null,
          currency: null,
          groupSize: null,
          exponent: null,
          minimumIntegerDigits: 3,
          maximumIntegerDigits: 3,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          minimumSignificantDigits: 0,
          maximumSignificantDigits: 0,
          symbols: this.__numberSymbols['latn'],
          paddingCharacter: null,
          patternLength: 3
        });
      },
      'CURRENCY': function(it) {
        var string = '';
        var _case;
        _case = this.__getPluralKeyword(it.price);
        switch(_case) {
          case 'one':
            string += 'some';
            break;
          case 'few':
            string += 'some';
            break;
          case 'many':
            string += 'some';
            break;
          default:
            string += 'some';
            break;
        }
        return string;
      },
      'NEW_KEY': function(it) {
        var string = '';

        return string;
      },
      'TEST': function(it) {
        var string = '';

        return string;
      }
    }
  };

  function l(key) {
    if(!(key in localizations['cs'])) {
      throw new TypeError('Key `' + key + '` not in cs localizations');
    }
    return localizations['cs'][key].call(localizations['cs'], arguments[1]);
  }

  if(typeof require === "function" && typeof exports === 'object' && typeof module === 'object') {
    module.exports = l;
  }
  else if (typeof define === "function" && define.amd) {
    define(function() {
      return l;
    });
  }
  else {
    window.l = l;
  }
})();
