class Sensor {
    public static final int SPRING = 0;
    public static final int SUMMER = 1;
    public static final int AUTUMN = 2;
    public static final int WINTER = 3;

    private static int season = (int) (Math.random() * 4);

    public static int getSeason(){
        return season;
    }

    public static String getSeasonName(int season){
        if (season == SPRING){
            return "Fruehling";
        } else if (season == SUMMER){
            return "Sommer";
        } else if (season == AUTUMN){
            return "Herbst";
        } else if (season == WINTER){
            return "Winter";
        }
        return "unbekannt";
    }

    public static int getMoisture(String plant){
        return (int) (Math.random() * 61);
    }
}
