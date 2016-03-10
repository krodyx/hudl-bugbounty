You'll need a `credentials.json` file in this folder to run these scripts. This will be of the following format:

```
{
    "sumologic_access_id": "",
    "sumologic_secret_key": "" 
}

```

You can generate an access-id and access-key for yourself in SumoLogic's preferences menu.

---

- The dictionary is a convenience for PyCharm, it doesn't serve any functional purpose.
- Because this uses the [Search API](https://github.com/SumoLogic/sumo-api-doc/wiki/Search-API#search), Sumo searches are limited to 10000 results. Trying to retrive more than an hour or two of logs will either take forever or fail to return.
- For examples of how to use the methods, check out the `__main__` methods. They'll write output to `sumo-output.json` by default.

---

Possible improvements:

- Make this into a package, for great Python justice
- Append date/time string to filename when retrieving results, for clarity
- Use the [Search Jobs API](https://github.com/SumoLogic/sumo-api-doc/wiki/Search-Job-API) to get greater than 10000 logs at once
- More Sumo magic to pull _exact_ times of logs as well as stack traces (we currently ignore stack traces).
