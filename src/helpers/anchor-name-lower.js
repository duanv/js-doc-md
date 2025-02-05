import util from 'util';

export const anchorNameLower = function anchorName(options) {
  if (!this.id) throw new Error('[anchorName helper] cannot create a link without a id: ' + JSON.stringify(this))
  if (this.inherited) {
    options.hash.id = this.inherits
    const inherits = _identifier(options)
    if (inherits) {
      return anchorName.call(inherits, options)
    } else {
      return ''
    }
  }
  return util.format(
    '%s%s%s',
    this.isExported ? 'exp_' : '',
    this.kind === 'constructor' ? 'new_' : '',
    this.id
      .replace(/:/g, '_')
      .replace(/~/g, '..')
      .replace(/\(\)/g, '_new')
      .replace(/#/g, '+')
      .toLowerCase()
  )
}