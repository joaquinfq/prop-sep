function get(obj, segments)
{
    let _value;
    if (segments.length)
    {
        if (isObject(obj))
        {
            const _key = segments.shift();
            if (_key in obj)
            {
                _value = get(obj[_key], segments);
            }
        }
    }
    else
    {
        _value = obj;
    }
    //
    return _value;
}

function has(obj, segments, exists = false)
{
    if (segments.length)
    {
        if (isObject(obj))
        {
            const _key = segments.shift();
            exists     = _key in obj;
            if (exists)
            {
                exists = has(obj[_key], segments, exists);
            }
        }
        else
        {
            exists = false;
        }
    }
    //
    return exists;
}

/**
 * Indica si el valor es un objeto.
 * No se excluyen los arrays para poder acceder haciendo `arr.0.key`.
 *
 * @param {*} value Valor a verificar.
 *
 * @return {boolean} `true` si el valor es un objeto.
 */
function isObject(value)
{
    return value && typeof value === 'object';
}

function remove(obj, segments)
{
    let _result;
    if (segments.length)
    {
        if (isObject(obj))
        {
            const _key = segments.shift();
            if (_key in obj)
            {
                if (segments.length)
                {
                    _result = remove(obj[_key], segments);
                }
                else
                {
                    _result = obj[_key];
                    delete obj[_key];
                }
            }
        }
    }
    //
    return _result;
}

function set(obj, segments, value)
{
    const _key = segments.shift();
    if (segments.length)
    {
        let _obj = obj[_key];
        if (!isObject(_obj))
        {
            // Hay que hacerlo en 2 pasos por si el objeto tiene un getter y un setter.
            // De esta manera, primero se llama al setter y luego al getter.
            obj[_key] = {};
            _obj      = obj[_key];
        }
        set(_obj, segments, value);
    }
    else if (_key)
    {
        obj[_key] = value;
    }
}

/**
 * Divide la clave en segmentos usando el separador.
 *
 * @param {string} key Clave a dividir.
 * @param {string} sep Separador a usar.
 *
 * @return {string[]} Segmentos obtenidos.
 */
function split(key, sep)
{
    if (!sep)
    {
        sep = '.';
    }
    const _segments = String(key).split(sep);
    if (key.includes('\\'))
    {
        let _index = 0;
        while (_index < _segments.length)
        {
            let _segment = _segments[_index];
            while (_segment.substr(-1) === '\\')
            {
                let _last = _segments.splice(_index + 1, 1).join('') || '';
                if (_last)
                {
                    _last = sep + _last;
                }
                _segment = _segments[_index] = _segment.substr(0, _segment.length - 1) + _last;
                if (_index === _segments.length - 1)
                {
                    break;
                }
            }
            ++_index;
        }
    }
    //
    return _segments;
}

/**
 * Métodos que permiten trabajar con objetos anidados.
 */
const methods = {
    /**
     * Devuelve el valor de la clave.
     *
     * @param {object}  obj    Objeto a manipular.
     * @param {string}  key    Nombre de la clave.
     * @param {*?}      defval Valor a usar si la clave no existe.
     * @param {string?} sep    Separador a usar (`.` por defecto).
     *
     * @return {*} Valor de la clave o `undefined` si no existe.
     */
    get(obj, key, defval, sep)
    {
        const _value = get(obj, split(key, sep));
        //
        return _value === undefined
            ? defval
            : _value;
    },
    /**
     * Indica si la clave existe.
     *
     * @param {object}  obj Objeto a manipular.
     * @param {string}  key Nombre de la clave. Se puede usar un `.` para separar objectos.
     * @param {string?} sep Separador a usar (`.` por defecto).
     *
     * @return {boolean} `true` si la clave existe.
     */
    has(obj, key, sep)
    {
        return has(obj, split(key, sep));
    },
    /**
     * Elimina la clave del objeto.
     *
     * @param {object}  obj Objeto a manipular.
     * @param {string}  key Nombre de la clave.
     * @param {string?} sep Separador a usar (`.` por defecto).
     *
     * @return {boolean} `true` si la clave se ha eliminado.
     */
    remove(obj, key, sep)
    {
        return remove(obj, split(key, sep));
    },
    /**
     * Asigna el valor de la clave.
     *
     * @param {object}  obj   Objeto a manipular.
     * @param {string}  key   Nombre de la clave.
     * @param {*}       value Valor a asignar a la clave.
     * @param {string?} sep   Separador a usar (`.` por defecto).
     *
     * @return {Object} Objeto manipulado.
     */
    set(obj, key, value, sep)
    {
        set(obj, split(key, sep), value);
        //
        return obj;
    }
};
/**
 * Funciones exportadas por el paquete.
 */
module.exports = Object.assign(
    {
        /**
         * Agrega los métodos `get`, `has`, `remove` y `set` a la definición de una clase.
         * Dependiendo del valor del parámetro `toPrototype` se agregarán como métodos de clase o métodos estáticos.
         *
         * @param {Function} Class        Referencia de la clase a modificar.
         * @param {boolean}  toPrototype  Indica si se agregán como métodos de clase o estáticos.
         * @param {boolean}  configurable Si los métodos pueden ser eliminados.
         */
        attach(Class, toPrototype = true, configurable = false)
        {
            if (Class)
            {
                if (toPrototype)
                {
                    Class = Class.prototype;
                }
                // Para hacerlo compatible con IE11 y que no falle al incluir este archivo,
                // se evita el uso spread/rest y del operador flecha.
                Object.keys(methods).forEach(
                    function (method)
                    {
                        Object.defineProperty(
                            Class,
                            method,
                            {
                                configurable,
                                value : function ()
                                {
                                    const _args = Array.prototype.slice.call(arguments);
                                    if (toPrototype)
                                    {
                                        _args.unshift(this);
                                    }
                                    return methods[method].apply(methods, _args);
                                }
                            }
                        );
                    }
                );
            }
        },
        /**
         * Elimina los métodos `get`, `has`, `remove` y `set` de la definición de una clase.
         * Dependiendo del valor del parámetro `toPrototype` se eliminarán los métodos de clase o métodos estáticos.
         *
         * @param {Function} Class       Referencia de la clase a modificar.
         * @param {boolean}  toPrototype Indica si se eliminarán los métodos de clase o los estáticos.
         */
        detach(Class, toPrototype = true)
        {
            if (Class)
            {
                if (toPrototype)
                {
                    Class = Class.prototype;
                }
                Object.keys(methods).forEach(method => delete Class[method]);
            }
        }
    },
    methods
);
