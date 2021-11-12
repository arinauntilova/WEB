class IRep {
    get(skip, limit) {
        console.log("получить элементы");
    }
    count() {
        console.log("получить число элементов");
    }
    findById(id){
        console.log("поиск по id");
    }
}

module.exports = IRep;
