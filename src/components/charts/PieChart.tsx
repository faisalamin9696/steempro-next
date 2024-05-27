import { ResponsivePie } from "@nivo/pie";

interface Props {
  data: any[];
  show?: boolean;
  handleItemClick: (id: string) => void;
}

function PieChart(props: Props) {
  const { data, show, handleItemClick } = props;

  return data.length >= 1 ? (
    <div className="p-2 rounded-md bg-foreground/5 relative h-[50vh] max-sm:h-[50vh] md:w-[80vw] max-sm:w-[90vw] overflow-hidden  pr-8">
      <ResponsivePie
        theme={{
          tooltip: {
            wrapper: {},
            container: {
              background: "#ffffff",
              color: "#333333",
              fontSize: 12,
            },
            basic: {},
            chip: {},
            table: {},
            tableCell: {},
            tableCellValue: {},
          },
        }}
        sortByValue
        colors={{ scheme: "nivo" }}
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsThickness={2}
        arcLinkLabelsDiagonalLength={8}
        arcLinkLabelsTextColor={{ from: "color", modifiers: [["darker", 1]] }}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLinkLabelsStraightLength={20}
        arcLinkLabelsTextOffset={5}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 60,
            itemsSpacing: 40,
            itemWidth: 50,
            itemHeight: 10,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 10,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#FFF",
                },
              },
            ],
          },
        ]}
        onClick={(node, event) => {
          try {
            handleItemClick(String(node.id));
          } catch {}
        }}
      />
    </div>
  ) : null;
}
export default PieChart;
