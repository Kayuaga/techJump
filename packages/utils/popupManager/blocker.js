const foo = () => {
    return new Promise(resolve => setTimeout(()=> {
        resolve('we are done! lets see here!!!!!!11 and the final one')
    }, 5000));
}

foo().then((res)=> { console.log(res)})

