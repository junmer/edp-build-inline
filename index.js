/**
 * @file inline 处理器
 * @author junmer[junmer@foxmail.com]
 */

/* eslint-env node */


/**
 * 对象属性拷贝
 *
 * @inner
 *
 * @param {Object} target 目标对象
 * @param {...Object} source 源对象
 * @return {Object} 返回目标对象
 */
function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i];
        if (src == null) {
            continue;
        }
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                target[key] = src[key];
            }
        }
    }
    return target;
}

/**
 * 获取文件内容
 *
 * @param  {Object} processContext 构建环境对象
 * @param  {string} path           文件路径
 * @return {string}                内容
 */
function getFileData(processContext, path) {

    var fileInfo = processContext.getFileByPath(path);

    if (fileInfo && fileInfo.data) {
        return fileInfo.data;
    }

    var errMsg = 'inline file: ' + path + ' not found';

    this.log.fatal(errMsg);

    throw new Error(errMsg);

}

/**
 * 替换标签内容
 *
 * @param  {string} content     目标全文
 * @param  {string} tag         标签
 * @param  {string} attribute   属性
 * @param  {Function} condition   替换条件
 * @param  {Function} tagReplacer 替换函数
 * @return {string}             替换结果
 */
function replaceTag(content, tag, attribute, condition, tagReplacer) {

    var attrReg = new RegExp('(' + attribute + ')=([\'"])([^\'"]+)\\2');
    var tagReg = new RegExp('<' + tag + '([^>]+)>', 'g');

    function replacer(match, attrStr) {
        if (typeof condition === 'function' && !condition(match.slice(1))) {
            return match;
        }

        /**
         * 匹配的属性
         *
         * [match, attrName, start, value]
         * @type {?Array}
         */
        var attrMatch = attrStr.match(attrReg);

        if (attrMatch && attrMatch[3]) {
            return tagReplacer(attrMatch[3]);
        }

        return match;

    }

    return content.replace(tagReg, replacer);

}


/**
 * isInlineTag
 *
 * @param  {string}  tagSource tag代码
 * @return {boolean}           判断结果
 */
function isInlineTag(tagSource) {
    return (/data-inline/).test(tagSource);
}

/**
 * isStylesheet
 *
 * @param  {string}  tagSource tag代码
 * @return {boolean}           判断结果
 */
function isStylesheet(tagSource) {
    return (/rel=("|')stylesheet("|')/).test(tagSource);
}


/**
 * inline
 *
 * @type {Object}
 */
var inline = {};

/**
 * 入口文件
 *
 * @type {Array}
 */
inline.files = [
    '*.html',
    '*.htm',
    '*.phtml',
    '*.tpl',
    '*.vm'
];

/**
 * 处理器名称
 *
 * @type {string}
 */
inline.name = 'InlineReplacer';

/**
 * 构建处理
 *
 * @param {FileInfo} file 文件信息对象
 * @param {ProcessContext} processContext 构建环境对象
 * @param {Function} callback 处理完成回调函数
 */
inline.process = function (file, processContext, callback) {

    var output = file.data;

    this.replacements.forEach(function (item) {

        output = replaceTag(
            output,
            item.tag,
            item.attribute,
            item.condition,
            item.replacer(processContext)
        );
    });

    file.setData(output);

    callback();
};

/**
 * inline 处理器
 *
 * @constructor
 * @param {Object} options 初始化参数
 */
function InlineReplacer(options) {

    /**
     * 获取资源
     *
     * @type {Function}
     */
    var resource = getFileData.bind(this);

    return extend({}, inline, {
        condition: isInlineTag,
        replacements: [
            {
                tag: 'link',
                attribute: 'href',
                condition: function (tagSource) {
                    return isInlineTag(tagSource) && isStylesheet(tagSource);
                },
                replacer: function (processContext) {
                    return function (path) {
                        return '<style>' + resource(processContext, path) + '</style>';
                    };
                }
            },
            {
                tag: 'script',
                attribute: 'src',
                condition: isInlineTag,
                replacer: function (processContext) {
                    return function (path) {
                        return '<script>' + resource(processContext, path);
                    };
                }
            }
        ]
    }, options);

}


module.exports = exports = InlineReplacer;
