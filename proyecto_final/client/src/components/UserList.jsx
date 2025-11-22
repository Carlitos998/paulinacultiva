import Button from '@mui/material/Button';
import { useEffect } from 'react';
import axios from 'axios'
import { useState } from 'react';
function UserList() {
    const [users, setUsers] = useState([])
    useEffect(() => {
        fetchUsers()
    }, [])
    const fetchUsers = async () => {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:3000/users', {
            headers: {
                authorization: token
            }
        })
        setUsers(response.data)

    }

    return (
        <>
            <h2>Usuarios</h2>
            {users && users.length !== 0 ? <ul>
                {
                    users.map((user) => {
                        return (
                            <li>
                                {user.firstName} - {user.lastName}
                            </li>
                        )
                    })
                }
            </ul> : <h2>Debes estar logueado</h2>}

        </>
    )
}

export default UserList