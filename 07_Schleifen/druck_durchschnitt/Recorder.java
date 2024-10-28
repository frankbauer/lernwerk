class Recorder {
    private static java.util.ArrayList<Measurement> values;
    private static int nextIndex = 0;

    private static void record(int day, int hour, double value){
        values.add(new Measurement(day*24 + hour - 298, (int)Math.round(value)));
    }

    private static void initIfNeeded(){
        if (values == null){
            values = new java.util.ArrayList<>();

            record(12, 10, 973.5);
            record(13, 19, 967.84);
            record(15, 22, 976.17);
            record(18, 9, 966.61);
            record(19, 17, 975.83);
            record(20, 18, 969.76);
            record(21, 21, 976.53);
            record(23, 5, 970.78);
            record(24, 4, 973.37);
            record(24, 21, 967.84);
            record(26, 9, 980.74);
            record(28, 18, 974.44);
            record(31, 11, 977.68);
            record(31+2, 18, 971.12);
            record(31+3, 11, 973.31);
            record(31+5, 17, 964.68);
            record(31+7, 9, 971.89);
            record(31+9, 13, 963.36);
            record(31+10, 12, 971.4);
            record(31+11, 10, 965.08);
        }
    }

    public static void reset(){
        initIfNeeded();
        nextIndex = 0;    
    }    

    public static Measurement getNext(){
        initIfNeeded();
        if (nextIndex < values.size()){
            return values.get(nextIndex++);
        }

        return null;
    }

    public static boolean hasMore(){
        initIfNeeded();
        return nextIndex < values.size();
    }
}
