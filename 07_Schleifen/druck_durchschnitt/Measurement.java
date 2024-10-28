class Measurement {
    public final int value;
    public final int timeInHours;

    public Measurement(int timeInHours, int value){
        this.timeInHours = timeInHours;
        this.value = value;
    }

    public String toString(){
        int month = 8;
        int day = (timeInHours / 24);
        String hour = "" + (timeInHours % 24);
        if (hour.length()<2){
            hour = "0" + hour;
        }

        if (day > 31){
            month++;
            day -= 31;
        }

        String m = "August";
        if (month == 9){
            m = "September";
        }
        return day + ". " + m + ", " + hour + ":00 Uhr = " + value + " hPa";
    }
}
