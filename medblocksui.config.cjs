const transformations = {
    'DV_QUANTITY': (n) => [{
        name: 'mb-quantity',
        html: `<mb-quantity path="${n.path}" label="${n.name}">
                ${n.inputs && n.inputs[1] && n.inputs[1].list ? n.inputs[1].list.map(unit => `<mb-unit unit="${unit.value}" label="${unit.label}"></mb-unit>`).join('\n') : ''}
            </mb-quantity>`
    },
    ],
    'DV_CODED_TEXT': (n) => [
        {
            name: 'mb-select',
            html: `<mb-select path="${n.path}" label="${n.name || ''}">
            ${n.inputs && n.inputs[0] && n.inputs[0].list ? n.inputs[0].list.map(option => `<mb-option code="${option.value}" display="${option.label}"></mb-option>`).join('\n') : ''}
          </mb-select>`
        }
    ],
    'DV_COUNT': (n) => [
        {
            name: 'Count',
            html: '<count></count>'
        }
    ],
    'DV_TEXT': (n) => [
        { name: 'dvtext', html: '<dv-text />' }
    ],
    'context': (n) => [
        { name: 'mb-context', html: `<mb-context path=${n.path} :data.prop="ctx.${n.id}"></mb-context>` }
    ]
}

module.exports.default = (leaf) => {
    if (leaf['inContext']) {
        return transformations['context'](leaf)
    }
    const fn = transformations[leaf.rmType]
    if (fn) {
        return fn(leaf)
    }
    return []
}