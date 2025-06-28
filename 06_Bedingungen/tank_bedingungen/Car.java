class Car {
    public static final int NORD = 0;
    public static final int NORDOST = 1;
    public static final int OST = 2;
    public static final int SUEDOST = 3;
    public static final int SUED = 4;
    public static final int SUEDWEST = 5;
    public static final int WEST = 6;
    public static final int NORDWEST = 7;

    private int direction;
    private float distance;
    private String name;
    private static java.util.ArrayList<Car> fillStat = new java.util.ArrayList<Car>();

    private Car (String name, int direction, float distance){
        this.name = name;
        this.direction = direction;
        this.distance = distance;
        fillStat.add(this);
    }

    private static Car tankN = new Car("Esso-Tankstelle Albaching Nord", NORD, (float)(Math.random()*150));
    private static Car tankNO = new Car("JET-Tankstelle Weissensee Nordost", NORDOST, (float)(Math.random()*150));
    private static Car tankO = new Car("ARAL-Tankstelle Knilch Ost", OST, (float)(Math.random()*150));
    private static Car tankSO = new Car("OMV-Tankstelle Steinach Suedost", SUEDOST, (float)(Math.random()*150));
    private static Car tankS = new Car("Shell-Tankstelle Welzer Sued", SUED, (float)(Math.random()*150));
    private static Car tankSW = new Car("TOTAL-Tankstelle Waldbad Suedwest", SUEDWEST, (float)(Math.random()*150));
    private static Car tankW = new Car("Agip-Tankstelle Reuther West", WEST, (float)(Math.random()*150));
    private static Car tankNW = new Car("BayWa-Tankstelle Heller Nordwest", NORDWEST, (float)(Math.random()*150));
    

    public static int getDirection(){
        return (int) (Math.random()*8);
    }

    public static void printDirection(int direction){
        if (direction == NORD){
            System.out.println("Fahrtrichtung: Norden");
        } else if (direction == NORDOST){
            System.out.println("Fahrtrichtung: Nordosten");
        } else if (direction == OST){
            System.out.println("Fahrtrichtung: Osten");
        } else if (direction == SUEDOST){
            System.out.println("Fahrtrichtung: Suedosten");
        } else if (direction == SUED){
            System.out.println("Fahrtrichtung: Sueden");
        } else if (direction == SUEDWEST){
            System.out.println("Fahrtrichtung: Suedwesten");
        } else if (direction == WEST){
            System.out.println("Fahrtrichtung: Westen");
        }else if (direction == NORDWEST){
            System.out.println("Fahrtrichtung: Nordwesten");
        }else{
            System.out.println("keine gueltige Fahrtrichtung fuer uebergebenen Wert gefunden");
        }
    }

    public static float getConsumption(){
        return 3.5f+(float)(Math.random()*10);
    }

    public static float getFillLevel(){
        return (float) (Math.random()*7);
    }

    private static float getDiversion(int drivingDir, int direction, float distance){
        float diversion;
        if (Math.abs(direction - drivingDir)<3){
            diversion = (float)(2*distance * Math.sin((direction-drivingDir)*Math.PI/4));
        }else{
            diversion = 2*distance;
        }
        return diversion;
    }

    public static String getFillingStation(int direction, float range){
        String fillingStation = null;
        int newDir;
        float diversion = 1500.0f;
        for(int i=0; i<8; i++){
            newDir = (direction+i)%8;
            if (newDir == NORD){
                if (range>=tankN.distance){
                    float div = getDiversion(direction, newDir, tankN.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankN.name;
                    }
                }
            } else if (newDir == NORDOST){
                if (range>=tankNO.distance){
                    float div = getDiversion(direction, newDir, tankNO.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankNO.name;
                    }
                }
            } else if (newDir == OST){
                if (range>=tankO.distance){
                    float div = getDiversion(direction, newDir, tankO.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankO.name;
                    }
                }
            } else if (newDir == SUEDOST){
                if (range>=tankSO.distance){
                    float div = getDiversion(direction, newDir, tankSO.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankSO.name;
                    }
                }
            } else if (newDir == SUED){
                if (range>=tankS.distance){
                    float div = getDiversion(direction, newDir, tankS.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankS.name;
                    }
                }
            } else if (newDir == SUEDWEST){
                if (range>=tankSW.distance){
                    float div = getDiversion(direction, newDir, tankSW.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankSW.name;
                    }
                }
            } else if (newDir == WEST){
                if (range>=tankW.distance){
                    float div = getDiversion(direction, newDir, tankW.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankW.name;
                    }
                }
            } else if (newDir == NORDWEST){
                if (range>=tankNW.distance){
                    float div = getDiversion(direction, newDir, tankNW.distance);
                    if (diversion > div){
                        diversion = div;
                        fillingStation = tankNW.name;
                    }
                }
            }
        }
        return fillingStation;
    }

    public static String getNearestFillingStation(){
        Car fillingStation = null;
        float dist = 200.0f;
        for(int t=0; t<fillStat.size(); t++){
            if (dist > fillStat.get(t).distance){
                fillingStation = fillStat.get(t);
                dist = fillStat.get(t).distance;
            }
        }
        if(fillingStation == null){
            return null;
        }
        return fillingStation.name;
    }

    public static float getDistance(String destination){
        for(int t=0; t<fillStat.size(); t++){
            if ((fillStat.get(t).name).equals(destination)){
                return fillStat.get(t).distance;
            }
        }
        System.out.println("Ziel nicht gefunden");
        return -1.0f;
    }

    public static void startNavigation(String destination){
        if (destination == null){
            System.out.println("Ziel nicht gefunden");
        }
        System.out.println("Navigation nach " + destination + " wird gestartet.");
    }
}
