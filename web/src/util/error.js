const errorHandler = (status, res) => {
    if (status !== 200 && status !== 201) {
        if (res.message) {
            throw new Error(res.message)
        } else {
            throw new Error(res.data[0].msg)
        }
    }
}

export default errorHandler;