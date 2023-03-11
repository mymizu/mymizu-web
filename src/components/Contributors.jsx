import React, { useEffect, useState } from "react";
const apiKey =
    "patZqW6kq6eJpR1rr.af975adfba875ba01c385ff086a6712767221ea337eac18af43624d004685335";
const baseId = "appnTJyNgaBLsKObm";
const tableName = "Contributors";

export default function Contributors() {
    const [contributors, setContributors] = useState([]);

    useEffect(() => {
        fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                setContributors(data.records);
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            {contributors.map(contributor => (
                <div>{contributor.fields.Name}</div>
            ))}
        </div>
    );
}
