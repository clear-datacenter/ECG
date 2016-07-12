/**
 * Author:      Tao-Quixote
 * CreateTime:  16/6/22 16:20
 */

var obj = {
    value: 100,
    get getVal(){
        return this.value;
    },
    set setVal(val) {
        this.value = val;
    }
};
Object.defineProperty(obj,'value', {
    enumerable: false,
    configurable: true,
    writable: false
});