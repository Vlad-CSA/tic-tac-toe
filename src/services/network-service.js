export default class NetworkService {

    _apiBase = 'http://localhost:8421/api.';

    signInReq = async (data) => {
        return await fetch(`${this._apiBase}authentication.signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            // нужно для передачи cookie
            credentials: 'include',
            body: JSON.stringify(data),
        });
    };

    signOutReq = async () => {
        return await fetch(`${this._apiBase}authentication.signout`, {
            method: 'GET',
            credentials: 'include',
        });
    };

    userCheck = async () => {
        return await fetch(`${this._apiBase}authentication.check`,{
            method: 'GET',
            credentials: 'include',
        });
    };

    sendDataFromUser = async (data) => {
        return await fetch(`${this._apiBase}user.setstate`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(data),
        });
    };

    receiveDataFromServer = async () => {
        return await fetch(`${this._apiBase}user.getstate`, {
            method: 'GET',
            credentials: 'include',
        }).then(res => res.json())
    }
}
