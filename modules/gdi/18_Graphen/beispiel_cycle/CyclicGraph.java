import java.util.*;

public class CyclicGraph {
    public static void print(Node<Integer> start) {
        if (start==null) { return; }
        printRec(start, new ArrayList<Node<Integer>>());
    }

    private static void printRec(Node<Integer> cur, ArrayList<Node<Integer>> visited) {
        if (!visited.contains(cur)) {
            visited.add(cur);

            System.out.print(cur.getPayload());
            for (Node<Integer> child : cur.childNodes()) {
                printRec(child, visited);
            }
        }
    }

    public static void main(String[] args){
        Graph<Integer> g = new Graph<>();
        g.add(1, 2, 3);
        g.addEdge(2, 3); g.addEdge(3, 2); g.addEdge(2, 1);

        CyclicGraph.print( g.find(2) );

        g.visualize();
    }
}