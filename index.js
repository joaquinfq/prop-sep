function get(segments, value)
{
    let _value;
    if (segments.length)
    {
        if (value && typeof value === 'object')
        {
            const _key = segments.shift();
            if (_key in value)
            {
                _value = get(segments, value[_key]);
            }
        }
    }
    else
    {
        _value = value;
    }

    return _value;
}

function has(segments, value, exists = false)
{
    if (segments.length)
    {
        if (value && typeof value === 'object')
        {
            const _key = segments.shift();
            exists = _key in value;
            if (exists)
            {
                exists = has(segments, value[_key], exists);
            }
        }
        else
        {
            exists = false;
        }
    }

    return exists;
}

function remove(segments, value)
{
    let _result;
    if (segments.length)
    {
        if (value && typeof value === 'object')
        {
            const _key = segments.shift();
            if (_key in value)
            {
                if (segments.length)
                {
                    _result = remove(segments, value[_key]);
                }
                else
                {
                    _result = value[_key];
                    delete value[_key];
                }
            }
        }
    }

    return _result;
}

function set(segments, object, value)
{
    const _key = segments.shift();
    if (segments.length)
    {
        let _value = object[_key];
        if (!_value || typeof _value !== 'object' || Array.isArray(_value))
        {
            _value = object[_key] = {}
        }
        set(segments, _value, value);
    }
    else if (_key)
    {
        object[_key] = value;
    }
}

function splitKey(key, sep)
{
    return String(key).split(sep);
}

/**
 * Funciones exportadas que permiten trabajar con objetos anidados.
 */
module.exports = {
    /**
     * Devuelve el valor de la clave.
     *
     * @param {String}  key    Nombre de la clave.
     * @param {*?}      defval Valor a usar si la clave no existe.
     * @param {String?} sep    Separador a usar (`.` por defecto).
     *
     * @return {*} Valor de la clave o `undefined` si no existe.
     */
    get(key, defval, sep)
    {
        const _value = get(splitKey(key, sep));

        return _value === undefined
            ? defval
            : _value;
    },
    /**
     * Indica si la clave existe.
     *
     * @param {String}  key Nombre de la clave. Se puede usar un `.` para separar objectos.
     * @param {String?} sep Separador a usar (`.` por defecto).
     *
     * @return {Boolean} `true` si la clave existe.
     */
    has(key, sep)
    {
        return has(splitKey(key, sep));
    },
    /**
     * Elimina la clave del objeto.
     *
     * @param {String} key  Nombre de la clave.
     * @param {String?} sep Separador a usar (`.` por defecto).
     */
    remove(key, sep)
    {
        return set(splitKey(key, sep), value);
    },
    /**
     * Asigna el valor de la clave.
     *
     * @param {String} key   Nombre de la clave.
     * @param {*?}     value Valor a asignar a la clave.
     * @param {String?} sep  Separador a usar (`.` por defecto).
     */
    set(key, value, sep)
    {
        return set(splitKey(key, sep), value);
    }
};

