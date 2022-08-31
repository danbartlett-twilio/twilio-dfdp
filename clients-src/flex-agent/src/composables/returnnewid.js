import short from 'short-uuid'

export function returnNewId() {
        
    return short.generate().substring(0,10)

}  