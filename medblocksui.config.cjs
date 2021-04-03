const transformations = {
    'DV_QUANTITY': (leaf) => [{
        name: 'mb-quantity',
        html: `<mb-quantity path="${leaf.path}" default="${leaf.inputs[1].list[0].value}" label="${leaf.name}">
                ${leaf.inputs[1].list.map(unit => `<mb-unit unit="${unit.value}" label="${unit.label}"></mb-unit>`).join('\n')}
            </mb-quantity>`
    },
    ],
    'DV_CODED_TEXT': (leaf) => [
        {
            name: 'mb-select',
            html: `<mb-select path="${leaf.path}" label="${leaf.name}">
            ${leaf.inputs[0].list.map(option => `<mb-option code="${option.value}" display="${option.label}"></mb-option>`).join('\n')}
          </mb-select>`
        }
    ],
    'DV_COUNT': (leaf) => [
        {
            name: 'Count',
            html: '<count></count>'
        }
    ],
    'DV_TEXT': (n) => [
        { name: 'dvtext', html: '<dv-text />' }
    ]
}

module.exports.default = (leaf) => {
    const fn = transformations[leaf.rmType]
    if (fn) {
        return fn(leaf)
    }
    return []
}