import { Text } from '@nextui-org/react';
import { SickCard, Layout } from '@/components';

const sicknessData = [
  {
    name: `Poumons`,
    rate: 5,
  },
  {
    name: `Coeur`,
    rate: 3,
  },
  {
    name: `Foie`,
    rate: 4,
  },
  {
    name: `Reins`,
    rate: 4,
  },
];

const Home = () => {
  return (
    <>
      <Layout>
        <>
          <div className="container m-auto grid grid-cols-2 gap-4">
            {sicknessData.map((sickness, index) => {
              return (
                <SickCard
                  key={index}
                  name={sickness.name}
                  rate={sickness.rate}
                />
              );
            })}
          </div>
        </>
      </Layout>
    </>
  );
};

export default Home;
