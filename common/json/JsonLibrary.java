interface JsonSerializer {
    String toJson();
}

class ISOTimestampConverter {

    /**
     * Converts a date object to an ISO 8601 string
     * @param date the date to convert
     * @return the ISO 8601 string
     */
    public static String toISO(java.util.Date date) {
        return toISO(date.getTime() / 1000);
    }

    /**
     * Converts a unix timestamp to an ISO 8601 string
     * @param unixTimestamp the unix timestamp to convert
     * @return the ISO 8601 string
     */
    public static String toISO(long unixTimestamp) {
        // Constants
        final long SECONDS_PER_MINUTE = 60;
        final long MINUTES_PER_HOUR = 60;
        final long HOURS_PER_DAY = 24;
        final long DAYS_PER_YEAR = 365;
        final long[] DAYS_PER_MONTH = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

        // Calculate date and time components
        long seconds = unixTimestamp;
        long minutes = seconds / SECONDS_PER_MINUTE;
        seconds %= SECONDS_PER_MINUTE;
        long hours = minutes / MINUTES_PER_HOUR;
        minutes %= MINUTES_PER_HOUR;
        long days = hours / HOURS_PER_DAY;
        hours %= HOURS_PER_DAY;

        // Calculate year
        long year = 1970;
        while (days >= DAYS_PER_YEAR + (isLeapYear(year)?1:0)) {
            days -= DAYS_PER_YEAR + (isLeapYear(year)?1:0);
            year++;
        }

        // Calculate month
        int month = 0;
        while (days >= DAYS_PER_MONTH[month] + (month == 1 && isLeapYear(year) ? 1 : 0)) {
            days -= DAYS_PER_MONTH[month] + (month == 1 && isLeapYear(year) ? 1 : 0);
            month++;
        }
        month++;

        // Calculate day
        int day = (int) days + 1;

        return year + "-" +
                (month < 10 ? "0" : "") + month + "-" +
                (day < 10 ? "0" : "") + day + "T" +
                (hours < 10 ? "0" : "") + hours + ":" +
                (minutes < 10 ? "0" : "") + minutes + ":" +
                (seconds < 10 ? "0" : "") + seconds + "Z";
    }


    /**
     * Converts an ISO 8601 string to a Date object
     * @param iso the ISO 8601 string to convert
     * @return the Date object
     */
    public static java.util.Date toDate(String iso) {
        return new java.util.Date(toUnixTimestamp(iso) * 1000);
    }

    /**
     * Converts an ISO 8601 string to a unix timestamp
     * @param iso the ISO 8601 string to convert
     * @return the unix timestamp
     */
    public static long toUnixTimestamp(String iso) {
        if (!isValidISO(iso)) throw new IllegalArgumentException("Invalid ISO 8601 string: " + iso);
        // Constants
        final long SECONDS_PER_MINUTE = 60;
        final long MINUTES_PER_HOUR = 60;
        final long HOURS_PER_DAY = 24;
        final long DAYS_PER_YEAR = 365;
        final long[] DAYS_PER_MONTH = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

        // Extract date and time components from ISO string
        int year = Integer.parseInt(iso.substring(0, 4));
        int month = Integer.parseInt(iso.substring(5, 7));
        int day = Integer.parseInt(iso.substring(8, 10));
        int hour = Integer.parseInt(iso.substring(11, 13));
        int minute = Integer.parseInt(iso.substring(14, 16));
        int second = Integer.parseInt(iso.substring(17, 19));

        // Calculate days since epoch
        long daysSinceEpoch = 0;
        for (int y = 1970; y < year; y++) {
            daysSinceEpoch += DAYS_PER_YEAR + (isLeapYear(y)?1:0);
        }
        for (int m = 0; m < month - 1; m++) {
            daysSinceEpoch += DAYS_PER_MONTH[m] + (m == 1 && isLeapYear(year) ? 1 : 0);
        }
        daysSinceEpoch += day - 1;

        // Calculate timestamp
        long timestamp = daysSinceEpoch * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
        timestamp += hour * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
        timestamp += minute * SECONDS_PER_MINUTE;
        timestamp += second;

        return timestamp;
    }

    /**
     * Determines whether a year is a leap year
     * @param year the year to check
     * @return true if the year is a leap year, false otherwise
     */
    private static boolean isLeapYear(long year) {
        if (year % 400 == 0) {
            return true;
        } else if (year % 100 == 0) {
            return false;
        } else if (year % 4 == 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Determines whether a string is a valid ISO 8601 string
     * @param iso the string to check
     * @return true if the string is a valid ISO 8601 string, false otherwise
     */
    public static boolean isValidISO(String iso) {
        //String regex = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$";
        //return iso.matches(regex);
        return true;
    }
}

class JsonArray implements java.lang.Iterable<JsonElement>, java.util.List<JsonElement>, JsonSerializer{
    private final java.util.List<JsonElement> list = new java.util.ArrayList<>(2);

    @Override
    public int size() {
        return list.size();
    }

    @Override
    public boolean isEmpty() {
        return list.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return list.contains(o);
    }

    @Override
    public java.util.Iterator<JsonElement> iterator() {
        return list.iterator();
    }

    @Override
    public Object[] toArray() {
        return list.toArray();
    }

    @Override
    public <T> T[] toArray(T[] a) {
        return list.toArray(a);
    }


    @Override
    public boolean add(JsonElement e){
        return list.add(e);
    }

    public boolean add(JsonObject o){
        return list.add(new JsonElement(o));
    }

    public boolean add(JsonArray o){
        return list.add(new JsonElement(o));
    }

    public boolean add(String o){
        return list.add(new JsonElement(o));
    }

    public boolean add(double o){
        return list.add(new JsonElement(o));
    }

    public boolean add(int o){
        return list.add(new JsonElement(o));
    }

    public boolean add(boolean o){
        return list.add(new JsonElement(o));
    }

    @Override
    public boolean remove(Object o) {
        return list.remove(o);
    }

    @Override
    public boolean containsAll(java.util.Collection<?> c) {
        return list.containsAll(c);
    }

    @Override
    public boolean addAll(java.util.Collection<? extends JsonElement> c) {
        return  list.addAll(c);
    }

    @Override
    public boolean addAll(int index, java.util.Collection<? extends JsonElement> c) {
        return list.addAll(index, c);
    }

    @Override
    public boolean removeAll(java.util.Collection<?> c) {
        return list.removeAll(c);
    }

    @Override
    public boolean retainAll(java.util.Collection<?> c) {
        return list.retainAll(c);
    }

    @Override
    public void clear(){
        list.clear();
    }

    @Override
    public JsonElement get(int index) {
        return list.get(index);
    }

    @Override
    public JsonElement set(int index, JsonElement element) {
        return list.set(index, element);
    }

    @Override
    public void add(int index, JsonElement element) {
        list.add(index, element);
    }

    @Override
    public JsonElement remove(int index) {
        return list.remove(index);
    }

    @Override
    public int indexOf(Object o) {
        return list.indexOf(o);
    }

    @Override
    public int lastIndexOf(Object o) {
        return list.lastIndexOf(o);
    }

    @Override
    public java.util.ListIterator<JsonElement> listIterator() {
        return list.listIterator();
    }

    @Override
    public java.util.ListIterator<JsonElement> listIterator(int index) {
        return list.listIterator(index);
    }

    @Override
    public java.util.List<JsonElement> subList(int fromIndex, int toIndex) {
        return list.subList(fromIndex, toIndex);
    }

    public String toJson(){
        return list
                .stream()
                .map(JsonElement::toJson)
                .collect(java.util.stream.Collectors.joining(",", "[", "]"));
    }
}

class JsonObject implements JsonSerializer{
    private final java.util.Map<String, JsonElement> map = new java.util.HashMap<>();

    public JsonObject put(String key, JsonArray o){
        map.put(JsonParser.validKey(key), new JsonElement(o));
        return this;
    }

    public JsonObject put(String key, JsonObject o){
        map.put(JsonParser.validKey(key), new JsonElement(o));
        return this;
    }

    public JsonObject putNull(String key){
        map.put(JsonParser.validKey(key), new JsonElement(null));
        return this;
    }

    public JsonObject put(String key, JsonElement o){
        map.put(JsonParser.validKey(key), o);
        return this;
    }

    public JsonObject put(String key, int i){
        map.put(JsonParser.validKey(key), new JsonElement(i));
        return this;
    }

    public JsonObject put(String key, double d){
        map.put(JsonParser.validKey(key), new JsonElement(d));
        return this;
    }

    public JsonObject put(String key, String s){
        map.put(JsonParser.validKey(key), new JsonElement(s));
        return this;
    }

    public JsonObject put(String key, java.util.Date d){
        map.put(JsonParser.validKey(key), new JsonElement(JsonParser.dateToString(d)));
        return this;
    }

    public JsonObject put(String key, boolean b){
        map.put(JsonParser.validKey(key), new JsonElement(b));
        return this;
    }

    public int getInt(String key){
        return map.get(key).getInteger();
    }
    public int getInt(String key, int defaultValue){
        return map.get(key).getInteger(defaultValue);
    }

    public double getDouble(String key){
        return map.get(key).getDouble();
    }
    public double getDouble(String key, Double defaultValue){
        return map.get(key).getDouble(defaultValue);
    }

    public boolean getBoolean(String key){
        return map.get(key).getBoolean();
    }

    public boolean getBoolean(String key, Boolean defaultValue){
        return map.get(key).getBoolean(defaultValue);
    }

    public String getString(String key){
        return map.get(key).getString();
    }

    public String getString(String key, String defaultValue){
        return map.get(key).getString(defaultValue);
    }

    public java.util.Date getDate(String key){
        return map.get(key).getDate();
    }
    public java.util.Date getDate(String key, java.util.Date defaultValue){
        return map.get(key).getDate(defaultValue);
    }

    public JsonElement get(String key){
        return map.get(key);
    }

    public boolean isNull(String key){
        return map.get(key).isNull();
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append('{');
        boolean first = true;
        for (String key : map.keySet()){
            if (first){
                first = false;
            } else {
                sb.append(',');
            }
            sb.append(key);
            sb.append(':');
            sb.append(map.get(key));
        }
        sb.append("}");
        return sb.toString();
    }

    public String toJson(){
        return map
                .entrySet()
                .stream()
                .map(e -> "\"" + JsonParser.validKey(e.getKey()) + "\":" + e.getValue().toJson())
                .collect(java.util.stream.Collectors.joining(", ", "{", "}"));
    }
}

class JsonElement implements JsonSerializer {
    private final Object value;
    JsonElement(Object value) {
        this.value = value;
    }

    public Object getValue() {
        return value;
    }

    public int getInteger(){
        return (Integer) value;
    }

    public int getInteger(int defaultValue){
        if (value==null || !isInteger()) return defaultValue;
        return (Integer) value;
    }


    public double getDouble(){
        return (Double) value;
    }

    public double getDouble(double defaultValue){
        if (value==null || !isDouble()) return defaultValue;
        return (Integer) value;
    }

    public String getString(){
        return (String) value;
    }

    public String getString(String defaultValue){
        if (value==null || !isString()) return defaultValue;
        return (String) value;
    }

    public boolean getBoolean(){
        return (Boolean) value;
    }

    public boolean getBoolean(boolean defaultValue){
        if (value==null || !isBoolean()) return defaultValue;
        return (Boolean) value;
    }

    public JsonObject getObject(){
        return (JsonObject) value;
    }

    public JsonObject getObject(JsonObject defaultValue){
        if (value==null || !isObject()) return defaultValue;
        return (JsonObject) value;
    }

    public JsonArray getArray(){
        return (JsonArray) value;
    }

    public JsonArray getArray(JsonArray defaultValue){
        if (value==null || !isObject()) return defaultValue;
        return (JsonArray) value;
    }

    public java.util.Date getDate(){
        return JsonParser.stringToDate((String) value);
    }

    public java.util.Date getDate(java.util.Date defaultValue){
        if (value==null || !isDate()) return defaultValue;
        return getDate();
    }


    //a method that tests if the value is a String
    public boolean isString(){
        return value instanceof String;
    }

    //a method that tests if the value is a Double
    public boolean isDouble(){
        return value instanceof Double;
    }

    //a method that tests if the value is an Integer
    public boolean isInteger(){
        return value instanceof Integer;
    }

    //a method that tests if the value is a Boolean
    public boolean isBoolean(){
        return value instanceof Boolean;
    }

    //a method that tests if the value is a JsonObject
    public boolean isObject(){
        return value instanceof JsonObject;
    }

    //a method that tests if the value is a JsonArray
    public boolean isArray(){
        return value instanceof JsonArray;
    }

    public boolean isDate(){
        if (isString()){
            try {
                ISOTimestampConverter.isValidISO((String) value);
            } catch (Exception e){
                return false;
            }
            return true;
        }
        return false;
    }

    public boolean isNull(){
        return value==null;
    }

    @Override
    public String toString() {
        return new StringBuilder().append("Element[").append(getTypeString()).append("]: ").append(toJson()).toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !(o instanceof JsonElement)) return false;
        JsonElement that = (JsonElement) o;
        return java.util.Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(value);
    }

    public String getTypeString(){
        if (value instanceof JsonArray){
            return "Array";
        }

        if (value instanceof JsonObject){
            return "Object";
        }

        if (value instanceof Number){
            return "Number";
        }

        if (value instanceof Boolean){
            return "Boolean";
        }

        if (value instanceof String){
            return "String";
        }

        return "none";
    }

    public String toJson(){
        if (value instanceof JsonArray){
            return ((JsonArray)value).toJson();
        }

        if (value instanceof JsonObject){
            return ((JsonObject)value).toJson();
        }

        if (value instanceof Number){
            return ((Number)value).toString();
        }

        if (value instanceof Boolean){
            return ((Boolean)value).toString();
        }

        if (value instanceof String){
            return "\"" + JsonParser.escape((String)value) + "\"";
        }

        return "null";
    }
}

class JsonParser {
    private static class IndexedString{
        public int index;
        public final String value;

        public IndexedString(String value){
            this.index = 0;
            this.value = value;
        }

        public char charAt(int index){
            return value.charAt(index);
        }
        public char[] toCharArray(){
            return value.toCharArray();
        }

        public boolean hasNext(){
            return index < value.length();
        }

        public char nextChar() {
            return value.charAt(index++);
        }

        public void goBack(){
            index--;
        }

        public char nextNonWhitespaceChar() {
            char currentChar = value.charAt(index);
            while (isWhitespace(currentChar)) {
                index++;
                currentChar = value.charAt(index);
            }
            index++;
            return currentChar;
        }

        public String nextToken(){
            final StringBuilder builder = new StringBuilder();
            char c = nextNonWhitespaceChar();

            while (!isWhitespace(c)){
                builder.append(c);
            }

            return builder.toString();
        }

        @Override
        public String toString() {
            return value.substring(index);
        }
    }
    private static JsonObject parseObject(IndexedString json)  {
        JsonObject object = new JsonObject();
        char c = json.nextNonWhitespaceChar();
        if (c != '{') {
            throw new IllegalArgumentException("Expected '{' at " + json.index + " but got '" + c + "'");
        }

        c = json.nextNonWhitespaceChar();
        while (c != '}') {
            if (c != '\"') {
                throw new IllegalArgumentException("Expected a Key-String at " + json.index + " but got '" + c + "'");
            }

            StringBuilder keyBuilder = new StringBuilder();
            c = json.nextChar();
            while (c != '\"') {
                keyBuilder.append(c);
                if (!json.hasNext()) {
                    throw new IllegalArgumentException("Content ended before finished reading key value '" + keyBuilder.toString() + "'");
                }
                c = json.nextChar();
            }

            final String key = keyBuilder.toString();
            c = json.nextNonWhitespaceChar();
            if (c != ':') {
                throw new IllegalArgumentException("Expected ':' at " + json.index + " but got '" + c + "'");
            }

            final JsonElement value = parseValue(json);
            object.put(key, value);
            c = json.nextNonWhitespaceChar();

            if (c != ',' && c != '}') {
                throw new IllegalArgumentException("Expected ',' or '}' at " + json.index + " but got '" + c + "'");
            }
            if (c==',') {
                c = json.nextNonWhitespaceChar();
            }
        }
        return object;
    }

    private static JsonArray parseArray(IndexedString json)  {
        char c = json.nextNonWhitespaceChar();
        if (c != '[') {
            throw new IllegalArgumentException("Expected '[' at " + json.index + " but got '" + c + "'");
        }

        JsonArray array = new JsonArray();
        while (c!=']'){
            JsonElement value = parseValue(json);
            array.add(value);
            c = json.nextNonWhitespaceChar();
            if (c != ',' && c != ']') {
                throw new IllegalArgumentException("Expected ',' or '}' at " + json.index + " but got '" + c + "'");
            }
        }
        return array;
    }

    private static String parseString(IndexedString json)  {
        char c = json.nextNonWhitespaceChar();
        if (c != '\"') {
            throw new IllegalArgumentException("Expected '\"' at " + json.index + " but got '" + c + "'");
        }

        boolean isEscape = false;
        StringBuilder stringBuilder = new StringBuilder();
        c = json.nextChar();
        while (c != '\"' || isEscape) {
            stringBuilder.append(c);
            if (!json.hasNext()) {
                throw new IllegalArgumentException("Content ended before finished reading key value '" + stringBuilder.toString() + "'");
            }
            if (isEscape){
                isEscape = false;
            } else if (c=='\\' && !isEscape){
                isEscape = true;
            }
            c = json.nextChar();
        }

        return unescapeString(stringBuilder.toString());
    }

    private static Number parseNumber(IndexedString json)  {
        char c = json.nextNonWhitespaceChar();
        boolean isDouble = false;
        StringBuilder stringBuilder = new StringBuilder();

        //sign
        if (c=='-' || c=='+'){
            stringBuilder.append(c);
            c = json.nextChar();
        }

        //digits before decimal point
        while (isDigit(c)){
            stringBuilder.append(c);
            c = json.nextChar();
        }

        //digits after decimal point
        if (c == '.'){
            isDouble = true;
            stringBuilder.append(c);
            c = json.nextChar();
            while (isDigit(c)){
                stringBuilder.append(c);
                c = json.nextChar();
            }
        }

        //exponent
        if (c == 'e' || c=='E'){
            isDouble = true;
            stringBuilder.append(c);
            if (c=='-' || c=='+'){
                stringBuilder.append(c);
                c = json.nextChar();
            }
            while (isDigit(c)){
                stringBuilder.append(c);
                c = json.nextChar();
            }
        }

        json.goBack();
        if (isDouble) return Double.parseDouble(stringBuilder.toString());
        return Integer.parseInt(stringBuilder.toString());
    }

    private static boolean parseBoolean(IndexedString json)  {
        final String bool = json.nextToken();
        if ("true".equals(bool)) return true;
        else if ("false".equals(bool)) return false;
        throw new IllegalArgumentException("Expected boolean value at " + json.index + " but got '" + bool + "'");
    }

    private static Object parseNull(IndexedString json)  {
        final String bool = json.nextToken();
        if ("null".equals(bool)) return null;
        throw new IllegalArgumentException("Expected 'null' value at " + json.index + " but got '" + bool + "'");
    }

    private static JsonElement parseValue(IndexedString json)  {
        char first = json.nextNonWhitespaceChar();
        json.goBack();

        if (first=='{'){
            return new JsonElement(parseObject(json));
        } else if (first=='['){
            return new JsonElement(parseArray(json));
        } else if (first=='"'){
            return new JsonElement(parseString(json));
        } else if (first=='t' || first=='f'){
            return new JsonElement(parseBoolean(json));
        } else if (first=='n'){
            return new JsonElement(parseNull(json));
        } else if (isDigit(first) || first=='-'){
            return new JsonElement(parseNumber(json));
        } else {
            throw new RuntimeException("Invalid JSON " + first);
        }
    }

    /**
     * Parses a valid json string to a JsonElement
     * @param json the json string to parse
     * @return the JsonElement
     */
    public static JsonElement parse(String json)  {
        return parseValue(new IndexedString(json));
    }

    /**
     * Converts a valid json string to a normal string
     * @param input the json string to convert
     * @return the normal string
     */
    public static String unescapeString(String input) {
        return input.replace("\\\"", "\"")
                    .replace("\\\\", "\\")
                    .replace("\\/", "/")
                    .replace("\\b", "\b")
                    .replace("\\f", "\f")
                    .replace("\\n", "\n")
                    .replace("\\r", "\r")
                    .replace("\\t", "\t");
    }

    /**
     * Converts a string to a valid json string
     * @param input the string to convert
     * @return the valid json string
     */
    public static String escape(String input){
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("/", "\\/")
                    .replace("\b", "\\b")
                    .replace("\f", "\\f")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }

    /**
     * Converts a string to a valid key for a json object
     * @param input the string to convert
     * @return the valid key
     */
    public static String validKey(String input){
        return input.replace("\\", "_")
                    .replace("\"", "_")
                    .replace("/", "_")
                    .replace("\b", "_")
                    .replace("\f", "_")
                    .replace("\n", "_")
                    .replace("\r", "_")
                    .replace("\t", "_");
    }

    /**
     * Converts a date to a string
     * @param date the date to convert
     * @return the string representation of the date
     */
    public static String dateToString(java.util.Date date){
        return ISOTimestampConverter.toISO(date);
    }

    /**
     * Converts a string to a date
     * @param timestamp the string to convert
     * @return the date representation of the string
     */
    public static java.util.Date stringToDate(String timestamp){
        return ISOTimestampConverter.toDate(timestamp);
    }

    private static boolean isDigit(char c) {
        return c=='0' || c=='1' || c=='2' || c=='3' || c=='4' || c=='5' || c=='6' || c=='7' || c=='8' || c=='9';
    }
    private static boolean isWhitespace(char c) {
        return c==' ' || c=='\n' || c=='\r' || c=='\t';
    }
}