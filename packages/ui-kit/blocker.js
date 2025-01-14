const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('we are done!Lets see how it works with with cache from master branch!' +
            ' Lets test it again testing cuncurrency')
    }, 5000));
}

foo().then((res)=> { console.log(res)})

