
console.log(`Welcome`);
window.narINUProvider = {
    message: "Hey I am under dev",
    requestAccounts: async function () {
        console.log('requestAccounts');
    },
    send: async function (request) {
        console.log('send');

    },
    on: function (eventName, callback) {
        console.log('on');

    }
};
console.log(`window.narINUProvider ${window.narINUProvider}`);
console.log(`Welcome 2`);
